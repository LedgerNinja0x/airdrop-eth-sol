## Quick Start
- Clone this repo and run 

```
npm install
```

and then spin up the dev server

```
npm run dev
```

Note: Login with twitter won't work on development

## Creating db
- Create a mongodb account with cluster name "Cluster0" (default)

That's it everything else will be configured automatically!

Peace
Saswat

## Things to implement

- Make secret call to /api/me/details to fetch metadata for user and update his profile: // done
- Admin dashboard that displays all user info with filtering and search options. //done
- Admin msg send to user and user msg verification with twitter cookies. //done
- Update user schema to accomodate for msg and hastags //done
- After successfull verification, add eth and sol address functionality
- Process complete, display a success alert