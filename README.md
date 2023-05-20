<div align="center">
    <img src="./assets/icon-round.png" alt="Timezones Icon" width="128" height="128" />
    <h1>Timezone Bot</h1>
</div>

**Timezone Bot** (or **Timezones**) is an open-source Discord bot which gives your members the ability to pin their timezone to their profile.

**Timezones** can be added to your Discord server [here](https://discord.com/oauth2/authorize?client_id=1107722770248384654&scope=bot&prompt=consent)

<div align="center">
  <img src="./assets/banner.png" alt="Timezones Banner" width="669" height="200">
</div>

# Command Documentation

~~**`/timezone info`** — shows general information about the bot and how to use it~~  
~~**`/timezone setup`** — adds a preset **Timezones** role to your server~~  
**`/timezone remove`** — removes your timezone from your profile  
**`/timezone update`** — prompts you to update your timezone  
**`/timezone check [@user]`** — shows you someone's set timezone

# Setting Up

After adding **Timezones** to your server, simply run the **`/timezone setup`** to create a role with **Timezones** linked!

# Hosting Timezones Yourself

> ### **Heads Up!**
>
> This section is still under construction.

Hosting **Timezones** yourself isn't the easiest thing to do, but if you're feeling brave you can follow this tutorial!

## Create a Cloudflare Worker

1. register on [workers.cloudflare.com](https://workers.cloudflare.com/)
2. go to the [dashboard](https://dash.cloudflare.com/) > Workers > Create a Service
3. choose a name > _Create Service_ (for example **`profile-timezones`**)

## Create a Discord Bot

1. go to the [discord developer portal](https://discord.com/developers/applications) > New Application
2. choose a name > _Create_
3. go to _Bot_ > _Create Bot_
4. copy the Application ID, Public Key, Client Secret & Bot Token

## Create a Redis Database

1. go to [upstash](https://console.upstash.com/)
2. blah blah

## Download from Github

1. run **`git clone https://github.com/Gabe616/timezone-bot.git`**
2. run **`cd timezone-bot`**
3. install dependencies using your preferred package manager (**`yarn install --prod`**)

## Secrets

1. copy your bot's Application ID, Public Key, Client Secret & Bot Token
2. copy your database's **`UPSTASH_REDIS_REST_URL`** & **`UPSTASH_REDIS_REST_TOKEN`**
3. go back to your cloudflare worker > _Settings_ > _Variables_ > _Edit variables_
4. add:

   - Public Key as **`discord_public_key`** (encrypt)
   - Client Secret as **`discord_client_secret`** (encrypt)
   - Bot Token as **`discord_token`** (encrypt)
   - **`UPSTASH_REDIS_REST_URL`** as **`redis_url`** (encrypt)
   - **`UPSTASH_REDIS_REST_TOKEN`** as **`redis_token`** (encrypt)

5. open **`timezone/bot/example.wrangler.toml`**
6. replace:

   - replace **`ApiURLHere`** with your cloudflare worker's url
     - remove the **`/`** at the end of the URL
   - replace **`CookieSecretHere`** with your cookie secret
     - generate a new secret using
       ```js
       crypto.randomUUID();
       ```
   - replace **`ClientIDHere`** with your client's ID

7. hit _Save and deploy_

## Finishing Up

3. run the setup script using your preferred package manager (**`yarn run setup`**)
4. rename **`timezone-bot`** to your cloudflare worker name (for example **`profile-timezones`**)
5. cd into your code **`cd CLOUDFLARE_WORKER_NAME`** (for example **`cd profile-timezones`**)
6. run **`wrangler login`**
7. build & publish to worker using your preferred package manager (**`yarn run publish`**)
