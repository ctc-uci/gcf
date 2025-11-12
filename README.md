# NPO Template Merged

A simple React, Vite, and Node.js monorepo built with Yarn workspaces. Uses Firebase for authentication, Chakra UI for components, and your choice of database (i.e. Postgres).

## Getting Started

### 1. Clone this repository, then `cd` into the directory

```shell
  git clone https://github.com/ctc-uci/npo-template-merged.git
  cd npo-template-merged
```

> [!WARNING]
> If you're a developer, you probably won't be cloning `npo-template-merged`. Replace `npo-template-merged` with the name of your team's repository.

> [!TIP]
> `npo-template-merged` is a template repository. [You can create a copy through Github.](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-repository-from-a-template)

### 2. Install dependencies

Install [Node.js, (version 18.20.4)](https://nodejs.org/en/download/package-manager). 

> [!TIP]
> On MacOS and Linux, installing Node with `nvm` is recommended!

Install [Yarn](https://classic.yarnpkg.com/lang/en/), our package manager of choice.

```shell
  > npm install --global yarn
```

Now, install packages:

```shell
  > yarn install
```

> [!TIP]
> This monorepo uses [Yarn Workspaces](https://classic.yarnpkg.com/lang/en/docs/workspaces/) to manage dependencies across repositories. Unless you know what you're doing, you should install dependencies (`yarn install`) at the root of the repository (i.e. not in `/client` or `/server`).
> 
> However, you should add _new_ dependencies (`yarn add`) in the directory which actually uses them.

### 3. Get environment secrets

Both the `client` and `server` directories have their own `.env.local` and `.env` files, respectively. These secrets should be provided to you by your tech leads. 

**Client**

The `client` `.env` consists primarily of your Firebase secrets. An example is provided in `/client/.env.example`. Copy the contents into a new file named `.env.local`, then fill in the keys with the appropriate values.

> [!TIP]
> The code block below is an example of what your `.env.local` should (partially) look like.

```shell
VITE_FIREBASE_APIKEY=my-api-key
VITE_FIREBASE_AUTHDOMAIN=my-project.firebaseapp.com
VITE_FIREBASE_PROJECTID=my-project-id
...
```

**Server**

The `server` `.env` consists primarily of your database secrets. An example is provided in `/server/.env.example`. Copy the contents into a new file named `.env`, then fill in the keys with the appropriate values.

### 4. Start developing!

Start the development server by running this command:

```shell
  yarn run dev
```

### 5. Run unit tests

We use [Vitetest](https://vitest.dev/) for testing client side code and [Supertest](https://www.npmjs.com/package/supertest) for testing HTTP requests 


Create unit tests in the `/server/src/__tests__/` directory (example `_name_.test.js`) 

#### Running individual unit tests
Example:
```sh
cd server
yarn test sample.test.js
```

#### Running all unit tests on backend 
```sh
yarn test --server # use when testing from root dir
# OR 
cd server
yarn test

```

#### Running all unit tests on frontend 
```sh
yarn test --client # use when testing from root dir
# OR 
cd client
yarn test
```
