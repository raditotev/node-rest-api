const { initializeApp } = require('firebase/app');
const { getStorage } = require('firebase/storage');

const { API_KEY, AUTH_DOMAIN, PROJECT_ID, BUCKET, SENDER_ID, APP_ID } =
  process.env;

const firebaseConfig = {
  apiKey: API_KEY,
  authDomain: AUTH_DOMAIN,
  projectId: PROJECT_ID,
  storageBucket: BUCKET,
  messagingSenderId: SENDER_ID,
  appId: APP_ID,
};

const firebaseApp = initializeApp(firebaseConfig);

// Get a reference to the storage service, which is used to create references in your storage bucket
const storage = getStorage(firebaseApp);

module.exports = storage;
