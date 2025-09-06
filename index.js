import express from 'express';
import admin from 'firebase-admin';
import { getDatabase, ref, set, get } from 'firebase-admin/database';

// Init Firebase Admin
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: "https://prop-shop-943e8-default-rtdb.firebaseio.com"
});

const db = getDatabase();
const app = express();
app.use(express.json());

// Webhook Xendit
app.post('/xendit-webhook', async (req, res) => {
  console.log('Webhook diterima:', req.body);

  const { id: invoiceId, status } = req.body;

  if (status === 'PAID') {
    const usersRef = ref(db, 'users');
    const snapshot = await get(usersRef);

    snapshot.forEach(userSnap => {
      const orders = userSnap.val().orders || {};
      for (const key in orders) {
        if (orders[key].invoiceId === invoiceId) {
          set(ref(db, `users/${userSnap.key}/orders/${key}/status`), 'paid');
          console.log(`Order ${key} untuk user ${userSnap.key} diupdate ke PAID`);
        }
      }
    });
  }

  res.status(200).send('OK');
});

// Jalankan server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
