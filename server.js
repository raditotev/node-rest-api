const mongoose = require('mongoose');
const app = require('./app');

if (process.env.NODE_ENV === 'test') {
  app.listen(4567);
} else {
  const { DB_USER, DB_PASSWORD, DB_NAME, PORT } = process.env;

  mongoose
    .connect(
      `mongodb+srv://${DB_USER}:${DB_PASSWORD}@cluster0.zaczj.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`
    )
    .then(() => {
      app.listen(PORT || 3000);
    })
    .catch((error) => {
      console.log(error);
    });
}
