<div align="center">
    <img src="./assets/icon-round.png" alt="Timezones Icon" width="128" height="128" />
    <h1>Timezone Bot — Selfhosting</h1>
</div>

# Info

**Timezone Bot**'s code is hosted on the worker (**`https://WORKER_NAME.AUTHOR_NAME.workers.dev`** => **`https://timezones.nexpid.workers.dev`**)
All non-API requests are sent to pages (**`https://WORKER_NAME.pages.dev`** => **`https://timezones.pages.dev`**)

# Requirements

- [Node](https://nodejs.org/en) => 18.16.0
- [Discord Account](https://discord.com/login)
- [Cloudflare Account](https://dash.cloudflare.com/login?lang=en-US)
- [Upstash Account](https://console.upstash.com/login)

# Setting Up

> ### **💡 Tip**
>
> Also install dev dependencies if you want to edit code
> Example: **`npm i -D`** (or **`yarn install --prod`**)

## 1. Init the repository

1. run **`git clone https://github.com/Gabe616/timezone-bot.git`**
2. run **`cd timezone-bot`**
3. run **`npm i`** (or **`yarn install`**)
4. run **`wrangler login`**

## 2. Creating Everything

- ## a. Creating Cloudflare Worker
  1. go to the [Cloudflare Dashboard](https://dash.cloudflare.com/)
  2. go to **Workers & Pages** > **Create application** > **Create Worker**
  3. set the name to whatever you'd like (remember this name, example: **timezones**)
  4. click **Deploy**
- ## b. Creating Discord Bot
  1. go to the [Discord Developer Portal](https://discord.com/developers/applications)
  2. click **New Application**
  3. choose your bot's name (example: **Timezones**)
- ## c. Creating Redis Database
  1. go to the [Upstash Console](https://console.upstash.com/)
  2. go to **Redis** > **Create Database**
  3. choose a random region & name

## 3. Building

1. cd into the website **`cd website`**
2. run **`npm i`** (or **`yarn install`**)
3. run **`npm i -g astro wrangler`** (or **`yarn global add astro wrangler`**)
4. run **`astro build`**
5. rename the **`timezone-bot`** folder to your cloudflare worker's name
6. cd into the folder **`cd WORKER_NAME`**
7. run **`npm i`** (or **`yarn install`**)
8. run **`npm run build`**

## 4. Secrets

1. copy your bot's Application ID, Public Key, Client Secret & Bot Token
2. copy your database's **`UPSTASH_REDIS_REST_URL`** & **`UPSTASH_REDIS_REST_TOKEN`**
3. go back to your cloudflare worker > **Settings** > **Variables** > **Edit variables**
4. add:
   - Public Key as **`discord_public_key`** (encrypt)
   - Client Secret as **`discord_client_secret`** (encrypt)
   - Bot Token as **`discord_token`** (encrypt)
   - **`UPSTASH_REDIS_REST_URL`** as **`redis_url`** (encrypt)
   - **`UPSTASH_REDIS_REST_TOKEN`** as **`redis_token`** (encrypt)
5. hit _Save and deploy_
6. open **`WORKER_NAME/example.wrangler.toml`**
7. replace:

   - replace **`ApiURLHere`** with your cloudflare worker's url
   - replace **`PagesURLHere`** with your cloudflare pages' url
     - pages is created in **5. Publishing**, URL is usually **`https://WORKER_NAME.pages.dev`**
   - replace **`CookieSecretHere`** with your cookie secret
     - generate a new secret using
       ```js
       crypto.randomUUID();
       ```
   - replace **`ClientIDHere`** with your client's ID

8. rename **`example.wrangler.toml`** to **`wrangler.toml`**
9. run **`npm run setup`** (or **`yarn run setup`**)

## 5. Publishing

> still in your **`WORKER_NAME`** folder

1. run **`npm run publish`**

- when prompted for pages settings, set name to your **`WORKER_NAME`** and branch to **`main`**

3. you're done ✨
