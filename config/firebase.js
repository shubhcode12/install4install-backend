const admin = require("firebase-admin");

const initializeFirebase = async () => {
  try {
    const serviceAccount = JSON.parse(
      Buffer.from(process.env.FIREBASE_ADMIN_BASE64, "base64").toString()
    );
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("Firebase Connected!")
  } catch (error) {
    console.error("Firebase Connection Error:", error);
    process.exit(1);
  }
};

module.exports = initializeFirebase;
