## Quick Start
- Clone this repo and run 

```
npm install
```

and then spin up the dev server

```
npm run dev
```

Open up **http://127.0.0.1:3000** and voila!

Note: Login with twitter won't work on development

## Creating db
- Create a mongodb account with cluster name "Cluster0" (default)

## Switching to production 
A production version of this app is already hosted on airdrop-rewards.netlify.com

All you need to do is:
- Change NEXTAUTH_URL in .env to the prod one
- Get new client id and client secret from twitter developer console and add redirect uris correctly https://airdrop-rewards.netlify.com/api/auth/callback/twitter

Push the code!

That's it everything else will be configured automatically!

Peace
Saswat

## Edits

- User add wallet as soon as he enters dashboard for first time(check ping cookie)