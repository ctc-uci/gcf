# Fixing `signInWithRedirect` with `patch-package`

> Author: Kevin Wu  
> Originally Written: 8/26/24  
> Last Updated: 11/07/24  

## Background

On June 24, 2024, cross origin redirect sign-in, the "default" way of signing in with Firebase using `signInWithRedirect` officially stopped working as part of a broader initiative blocking third-party cookies across Chrome browsers (which was also preceded by Firefox and Safari doing the same).

As a result, applications utilizing `signInWithRedirect` would no longer work by default. The Firebase team released documentation describing [best practices](https://firebase.google.com/docs/auth/web/redirect-best-practices) for enabling `signInWithRedirect` to continue working. For CTC's purposes, the only viable option was Option 3, which proxied auth requests from our domain to firebaseapp.com. 

However, due to the usage of hard-coded `https` in two key locations:
- [`getHandlerBase`](https://github.com/firebase/firebase-js-sdk/blob/4ff947408728ce4ae20229d7eb0cd71c3e65c885/packages/auth/src/core/util/handler.ts#L132)
- [`getIframeUrl`](https://github.com/firebase/firebase-js-sdk/blob/4ff947408728ce4ae20229d7eb0cd71c3e65c885/packages/auth/src/platform_browser/iframe/iframe.ts#L58)

... OAuth paths would be routed to `https`, which would not exist for local development (`http`). 

## Solution

### 1. Proxy auth requests

Updating our client/`vite.config.ts` file allows us to easily proxy auth requests from our domain to firebaseapp.com.

```
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig(() => {
  return {
    plugins: [react()],
+   server: {
+     proxy: {
+       "/__/auth": {
+         target: "https://your-project.firebaseapp.com", // make sure to change this to your actual authDomain (provided in your Firebase config)!
+         changeOrigin: true,
+         secure: true,
+         rewrite: (path) => path.replace(/^\/__\/auth/, "/__/auth"),
+       },
+     },
+   },
  };
});
```

> [!IMPORTANT]
> Also make sure to add `http://localhost:3000/__/auth/handler` to `Authorized redirect URIs` in the Google Cloud Console (a project should be automatically created for your Firebase project)

### 2. Patching `@firebase/auth`

### What is `patch-packages`?

[`patch-packages`](https://www.npmjs.com/package/patch-package) is a fantastic library that allows quick, robust fixes to npm dependencies that are encountered on "the bleeding edge". In short, it allows us to programmatically "save" fixes and apply them whenever we run `yarn install`. This is great, for instance, if you wanted to apply a fix and make sure that fellow developers in your organization would also see the same fixes. 

### Un-hoisting `firebase`

Our monorepo is built using [Yarn workspaces](https://classic.yarnpkg.com/lang/en/docs/workspaces/), a great way to manage dependencies across multiple repositories. One included feature is "hoisting", which aims to reduce duplicated dependencies. 

The TL;DR is that packages are installed at the root `node_modules` level, and critically, not within invidiual repositories (e.g. `/client`). Because our repositories are [deployed individually](https://docs.google.com/document/d/18Nnfs0Au9-SmcRsaKHVpZQUiNm5xL6H6IA7E01L6cYE/), patches need to be applied within invidiual repositories, not at the root.

To un-hoist `firebase`, we can make the following change to our root `package.json`:

```
  "workspaces": {
    "packages": [
      "client",
      "server"
    ],
+   "nohoist": [
+     "**/firebase",
+     "**/firebase/**"
+   ]
  }
```

> [!TIP]
> `firebase/auth` is installed as a package within `firebase`, so although we're only interested in `firebase/auth`, we need to un-hoist the whole `firebase` page.

> [!TIP]
> The patterns `**/your-package` and `**/your-package/**` "instructs yarn not to hoist `[your-package]` and all of its dependencies". See this [blog post](https://classic.yarnpkg.com/blog/2018/02/15/nohoist/) on `nohoist` to learn more!

> [!TIP]
> `nohoist` should be used sparingly. Preventing a flattening (de-duplication) of dependencies is, in most cases, inherently wasteful!

### Installing `patch-package`

In `client/package.json`, add this script:

```
"scripts": {
+  "postinstall": "patch-package"
}
```

In `client/`, run this command:

```
yarn add patch-package postinstall-postinstall
```

> [!TIP]
> "To understand why yarn needs the postinstall-postinstall package see: [Why use postinstall-postinstall](https://www.npmjs.com/package/patch-package#why-use-postinstall-postinstall-with-yarn)"

### Ensuring a clean slate

Delete `node_modules` in both the root and in `/client`. Then run `yarn install --force`, which ["refetches all packages, even ones that were previously installed."](https://classic.yarnpkg.com/en/docs/cli/install#toc-yarn-install-force)

### Making the patch

In our case, the offending file for `firebase@10.12.5`  can be found here: `node_modules/@firebase/auth/dist/esm2017/index-21205181.js`. 

> [!TIP]
> In case this file doesn't exist, or you're aiming to patch another file, a handy trick (if you know some portion of the file you'd like to patch), is to run `grep`:
> 
> `grep -rl --include="*.js" '[some-code-snippet]' .`
>
> This command will recursively `-r` look for Javascript files `--include"*.js"` which include the supplied string `'[some-code-snippet]'` across all files `.` and return only the file paths `-l`.

Then, we can make our edits to `getIframeUrl` and `getHandlerBase`. 

Once that's complete, we can run `npx patch-package @firebase/auth` within the `/client` directory. If all is well, a similar output should be displayed:

```
> npx patch-package @firebase/auth
patch-package 8.0.0
• Creating temporary folder
• Installing @firebase/auth@1.7.6 with yarn
• Diffing your files with clean files
✔ Created file patches/@firebase+auth+1.7.6.patch

💡 @firebase/auth is on GitHub! To draft an issue based on your patch run

    yarn patch-package @firebase/auth --create-issue
```

You should now see an auto-generated `client/patches` directory containing your patch! 

### Validating Solution

To test that everything is working:

1. Repeat the steps in "Ensuring a clean slate". Then, run `yarn dev` and see if `signInWithRedirect` is working as expected on `http`.
2. Repeat the steps in "Ensuring a clean slate" but **do not** run `yarn install --force`. Instead, only run `yarn install --force` in `/client` (this is to simulate an isolated deployment). Then, run `yarn dev` and see if `signInWithRedirect` is working as expected on `http`.

## Bonus Reading

If you've made it to the bottom of this document, you deserve a cookie 🍪! 

And if you're at all interested in another solution which uses `https` in local development to fix `signInWithRedirect`, check out `client/docs/DEPRECATED/signInWithRedirect.md`!
