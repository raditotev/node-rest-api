# Nodejs, Express, Mongo REST API

## Project setup

- `npm install`
- create `nodemon.json` in the root of the project
- add your secrets
  ```json
  {
    "env": {
      "NODE_ENV": "development",
      "DB_USER": "xxxxxxx",
      "DB_PASSWORD": "xxxxxxx",
      "DB_NAME": "xxxxxxx",
      "API_KEY": "firebase-xxxxxxx",
      "AUTH_DOMAIN": "firebase-xxxxxxx",
      "PROJECT_ID": "firebase-xxxxxxx",
      "BUCKET": "firebase-xxxxxxx",
      "SENDER_ID": "firebase-xxxxxxx",
      "APP_ID": "firebase-xxxxxxx",
      "JWT_SECRET": "xxxx"
    }
  }
  ```

## Scripts

- run tests `npm test`
- start dev server `npm run serve`
- start production server `npm start`

## Endpoints

```
POST /users/signup
POST /users/login
```

**Unauthenticated**

```
GET /products
GET /products/:id
```

**Authenticated**

```
POST /products
PATCH /products/:id
DELETE /products/:id

GET /orders
GET /orders/:id
POST /orders
DELETE /orders/:id
```
