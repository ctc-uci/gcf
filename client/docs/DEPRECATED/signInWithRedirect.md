# [DEPRECATED] `signInWithRedirect` without 3rd Party Cookies

> Author: Kevin Wu  
> Originally written: 8/25/24  
> Last Updated: 8/26/24  

> [!IMPORTANT]  
> As of 8/26/24, this README is **no longer accurate in any form whatsoever**. This README documents a previously implemented solution to a bug in `firebase/auth` which forced development on `https` in order to use `signInWithRedirect`. Thankfully, a simple patch using `patch-package` has allowed us to resolve this problem while a proper fix is shipped by the Firebase team. 

On June 24, 2024, cross origin redirect sign-in, the "default" way of signing in
with Firebase using `signInWithRedirect` officially stopped working as part of a
broader initiative blocking third-party cookies across Chrome browsers (which
was also preceded by Firefox and Safari doing the same).

As a result, applications using `signInWithRedirect` were advised to find a
solution described in [Firebase's best practices](https://firebase.google.com/docs/auth/web/redirect-best-practices).

In short, the most viable option for a self-hosted application was [Option 3: Proxy auth requests to firebaseapp.com](https://firebase.google.com/docs/auth/web/redirect-best-practices#proxy-requests).

## How To

### 1. Update the `authDomain` in your Firebase config

```
+ VITE_FIREBASE_AUTHDOMAIN=localhost:3000
- VITE_FIREBASE_AUTHDOMAIN=your-project.firebaseapp.com
```

### 2. Update your Vite config

First, Install the Vite SSL plugin: `yarn add -D @vitejs/plugin-basic-ssl`

Then, edit your config as shown below:

```
import basicSsl from "@vitejs/plugin-basic-ssl";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig(() => {
  return {
    plugins: [react(), basicSsl()],
    server: {
      proxy: {
        "/__/auth": {
          target: "https://npo-template-merged.firebaseapp.com",
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/__\/auth/, "/__/auth"),
        },
      },
    },
  };
});
```

> [!IMPORTANT]  
> Adding `basicSsl()` will result in the application running on https: `https://localhost`. This is an unfortunate result of `firebase/auth` having a bug (feature?) where all redirects are routed to `https`. 
> This issue is being tracked [here](https://github.com/firebase/firebase-js-sdk/issues/7342) with a semi-working PR [here](https://github.com/firebase/firebase-js-sdk/pull/7783), but currently the only solution appears to be to develop locally using `https`.

### 3. Update Google Cloud Console
Go to the [Google Cloud Console](https://console.cloud.google.com/) and find the project associated with your Firebase instance. 

Navigate to the [credentials page](https://console.cloud.google.com/apis/credentials) and under OAuth 2.0, update the Web Client's Authorized Javascript origins and Authorized redirect URIs. 

You'll want to add

...under Authorized Javascript origins:
- https://localhost
- http://localhost:3000
- https://localhost:3000

...under Authorized redirect URIs:
- http://localhost:3000/__/auth/handler
- https://localhost:3000/__/auth/handler

> [!NOTE]  
> Make sure to update this configuration with your eventual deployment domains!

<img width="400" alt="Google Cloud Console configuration" src="https://github.com/user-attachments/assets/9dc63ad0-8de2-4f45-9099-c38ea94e40ca">

### 4. Update Firebase Console
When ready to deploy, you'll also need to add your eventual domain to the list of authorized domains in Firebase

<img width="900" alt="Firebase Console settings" src="https://github.com/user-attachments/assets/d4ce1001-ab22-49b9-8c09-bf433c3cd27f">
