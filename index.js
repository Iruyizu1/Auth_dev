const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');

admin.initializeApp();
const db = admin.firestore();
const app = express();
app.use(cors({ origin: true }));

// Middleware untuk autentikasi
const authenticate = async (req, res, next) => {
    const idToken = req.headers.authorization?.split('Bearer ')[1];
    if (!idToken) {
        return res.status(401).send('Unauthorized');
    }
    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        req.user = decodedToken;
        next();
    } catch (error) {
        return res.status(401).send('Unauthorized');
    }
};

// API untuk mendapatkan profil pengguna
app.get('/profile', authenticate, async (req, res) => {
    const userId = req.user.uid;
    try {
        const userDoc = await db.collection('users').doc(userId).get();
        if (!userDoc.exists) {
            return res.status(404).send('User not found');
        }
        return res.json(userDoc.data());
    } catch (error) {
        return res.status(500).send(error.message);
    }
});

exports.api = functions.https.onRequest(app);
