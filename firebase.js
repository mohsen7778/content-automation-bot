const admin = require('firebase-admin');

// We will put the "Service Account Key" in GitHub Secrets later
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.FIREBASE_BUCKET_NAME // e.g., "my-project.appspot.com"
});

const bucket = admin.storage().bucket();

async function uploadFile(filePath) {
  const fileName = `blog-images/${Date.now()}.png`;
  
  // 1. Upload the file to the bucket
  const [file] = await bucket.upload(filePath, {
    destination: fileName,
    public: true, // Makes the image viewable by the public
    metadata: {
      contentType: 'image/png',
    },
  });

  // 2. Return the public URL
  // Note: Depending on your Firebase settings, you might need this format:
  return `https://storage.googleapis.com/${bucket.name}/${fileName}`;
}

module.exports = { uploadFile };
