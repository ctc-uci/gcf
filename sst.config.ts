// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path=".sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: 'gcf',
      removal: input?.stage === 'production' ? 'retain' : 'remove',
      protect: ['production'].includes(input?.stage),
      home: 'aws',
      providers: {
        aws: {
          region: 'us-west-1',
          profile: process.env.CI ? undefined : 'gcf',
        },
      },
    };
  },

  async run() {
    // ── Secrets ──────────────────────────────────────────────
    const firebaseApiKey = new sst.Secret('FirebaseApiKey');
    const firebaseAuthDomain = new sst.Secret('FirebaseAuthDomain');
    const firebaseProjectId = new sst.Secret('FirebaseProjectId');
    const firebaseStorageBucket = new sst.Secret('FirebaseStorageBucket');
    const firebaseMessagingSenderId = new sst.Secret(
      'FirebaseMessagingSenderId'
    );
    const firebaseAppId = new sst.Secret('FirebaseAppId');
    const firebaseMeasurementId = new sst.Secret('FirebaseMeasurementId', '');
    const firebaseAdminSdkJson = new sst.Secret('FirebaseAdminSdkJson');

    const dbHostname = new sst.Secret('DbHostname');
    const dbUsername = new sst.Secret('DbUsername');
    const dbPassword = new sst.Secret('DbPassword');
    const dbName = new sst.Secret('DbName');
    const dbPort = new sst.Secret('DbPort', '5432');

    // Empty-string defaults make these optional so you can deploy before setting
    // them. Email and YouTube features stay inactive until real values are set.
    const emailUsername = new sst.Secret('EmailUsername', '');
    const emailPassword = new sst.Secret('EmailPassword', '');
    const youtubeApiKey = new sst.Secret('YoutubeApiKey', '');

    // Placeholder defaults to wildcard, replace later with actual cloudfront url
    const corsAllowedOrigins = new sst.Secret('CorsAllowedOrigins', '*');

    // ── Uploads bucket ───────────────────────────────────────
    const mediaBucket = new sst.aws.Bucket('MediaBucket');

    // ── Backend API (Lambda + Function URL) ──────────────────
    const api = new sst.aws.Function('Api', {
      handler: 'server/src/handler.handler',
      runtime: 'nodejs20.x',
      memory: '512 MB',
      timeout: '29 seconds',
      // No esbuild plugin needed for the @/ path aliases: esbuild has native
      // support for tsconfig "paths" and auto-discovers server/tsconfig.json
      // by walking up from the entry point (server/src/handler.ts).
      url: { cors: false }, // Express handles CORS itself
      environment: {
        NODE_ENV: 'production',
        PROD_SERVER_PORT: '3001',

        PROD_DB_HOSTNAME: dbHostname.value,
        PROD_DB_USERNAME: dbUsername.value,
        PROD_DB_PASSWORD: dbPassword.value,
        PROD_DB_NAME: dbName.value,
        PROD_DB_PORT: dbPort.value,

        FIREBASE_ADMIN_SDK_JSON: firebaseAdminSdkJson.value,

        PROD_S3_BUCKET_NAME: mediaBucket.name,
        PROD_S3_REGION: 'us-west-1',

        EMAIL_USER: emailUsername.value, // unprefixed — matches nodemailer.js
        EMAIL_PASS: emailPassword.value,

        PROD_YOUTUBE_API_KEY: youtubeApiKey.value,

        PROD_CLIENT_HOSTNAME: corsAllowedOrigins.value, // maps to CORS in app.ts
      },
      link: [mediaBucket], // auto-grants the Lambda IAM access to the bucket
    });

    // ── Frontend (S3 + CloudFront) ───────────────────────────
    const site = new sst.aws.StaticSite('Client', {
      path: 'client',
      build: { command: 'yarn build', output: 'dist' },
      environment: {
        VITE_BACKEND_HOSTNAME: api.url,
        VITE_FIREBASE_APIKEY: firebaseApiKey.value,
        VITE_FRONTEND_HOSTNAME: firebaseAuthDomain.value, // used as authDomain
        VITE_FIREBASE_PROJECTID: firebaseProjectId.value,
        VITE_FIREBASE_STORAGEBUCKET: firebaseStorageBucket.value,
        VITE_FIREBASE_MESSAGINGSENDERID: firebaseMessagingSenderId.value,
        VITE_FIREBASE_APPID: firebaseAppId.value,
        VITE_FIREBASE_MEASUREMENTID: firebaseMeasurementId.value,
      },
      errorPage: 'index.html', // SPA routing
    });

    return { api: api.url, site: site.url };
  },
});
