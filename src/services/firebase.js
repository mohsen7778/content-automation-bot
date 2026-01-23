const admin = require('firebase-admin');

// Initialize only once
if (!admin.apps.length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: process.env.FIREBASE_BUCKET_NAME
    });
}

const bucket = admin.storage().bucket();

async function uploadFile(filePath) {
    const fileName = `blog-images/${Date.now()}.png`;
    
    try {
        console.log(`Uploading ${filePath} to bucket: ${process.env.FIREBASE_BUCKET_NAME}...`);
        
        // Upload the file
        await bucket.upload(filePath, {
            destination: fileName,
            public: true,
            metadata: { contentType: 'image/png' }
        });

        // This creates a public URL that Blogger can definitely read
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
        console.log("Image uploaded successfully: " + publicUrl);
        return publicUrl;
    } catch (error) {
        console.error("Firebase Upload Error:", error.message);
        throw error;
    }
}

module.exports = { uploadFile };
