require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Configuration Bridge (variables d'environnement)
const BRIDGE_API_URL = process.env.BRIDGE_API_URL; // ex: https://api.bridgeapi.io/v2
const CLIENT_ID = process.env.BRIDGE_CLIENT_ID;
const CLIENT_SECRET = process.env.BRIDGE_CLIENT_SECRET;

// --------------------
// 1️⃣ Route santé
// --------------------
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is running' });
});

// --------------------
// 2️⃣ Créer un utilisateur Bridge
// --------------------
app.post('/api/bridge/users', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  // Si les variables Bridge sont définies, on appelle Bridge réel
  if (BRIDGE_API_URL && CLIENT_ID && CLIENT_SECRET) {
    try {
      // Authentification Bridge
      const authResponse = await axios.post(`${BRIDGE_API_URL}/authenticate`, {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET
      });
      const accessToken = authResponse.data.access_token;

      // Création utilisateur
      const userResponse = await axios.post(
        `${BRIDGE_API_URL}/users`,
        { email },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'Bridge-Version': '2021-06-01'
          }
        }
      );

      return res.json({
        user: userResponse.data,
        access_token: accessToken
      });

    } catch (error) {
      console.error('Erreur création utilisateur réel:', error.response?.data || error.message);
      return res.status(500).json({
        error: 'User creation failed',
        details: error.response?.data || error.message
      });
    }
  }

  // Sinon, fallback mock
  console.log("Création utilisateur mock avec email:", email);
  return res.json({ userUuid: "fake-user-uuid" });
});

// --------------------
// 3️⃣ Récupérer les comptes bancaires
// --------------------
app.get('/api/bridge/accounts', async (req, res) => {
  const { user_uuid } = req.query;
  if (!user_uuid) return res.status(400).json({ error: 'user_uuid is required' });

  if (BRIDGE_API_URL && CLIENT_ID && CLIENT_SECRET) {
    try {
      const authResponse = await axios.post(`${BRIDGE_API_URL}/authenticate`, {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET
      });
      const accessToken = authResponse.data.access_token;

      const accountsResponse = await axios.get(
        `${BRIDGE_API_URL}/users/${user_uuid}/accounts`,
        { headers: { 'Authorization': `Bearer ${accessToken}`, 'Bridge-Version': '2021-06-01' } }
      );

      return res.json(accountsResponse.data);
    } catch (error) {
      console.error('Erreur comptes réel:', error.response?.data || error.message);
      return res.status(500).json({
        error: 'Failed to fetch accounts',
        details: error.response?.data || error.message
      });
    }
  }

  // Fallback mock
  return res.json([
    { id: 1, name: "Compte courant", balance: 2500 },
    { id: 2, name: "Épargne", balance: 5000 }
  ]);
});

// --------------------
// 4️⃣ Récupérer les transactions
// --------------------
app.get('/api/bridge/transactions', async (req, res) => {
  const { user_uuid } = req.query;
  if (!user_uuid) return res.status(400).json({ error: 'user_uuid is required' });

  if (BRIDGE_API_URL && CLIENT_ID && CLIENT_SECRET) {
    try {
      const authResponse = await axios.post(`${BRIDGE_API_URL}/authenticate`, {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET
      });
      const accessToken = authResponse.data.access_token;

      const transactionsResponse = await axios.get(
        `${BRIDGE_API_URL}/users/${user_uuid}/transactions`,
        {
          headers: { 'Authorization': `Bearer ${accessToken}`, 'Bridge-Version': '2021-06-01' },
          params: { limit: 100 }
        }
      );

      return res.json(transactionsResponse.data);
    } catch (error) {
      console.error('Erreur transactions réel:', error.response?.data || error.message);
      return res.status(500).json({
        error: 'Failed to fetch transactions',
        details: error.response?.data || error.message
      });
    }
  }

  // Fallback mock
  return res.json([
    { id: 1, label: "Salaire", amount: 2500, date: "2026-01-01" },
    { id: 2, label: "Loyer", amount: -800, date: "2026-01-05" }
  ]);
});

// --------------------
// 5️⃣ Lancement du serveur
// --------------------
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
  console.log(`✅ Bridge API configured: ${BRIDGE_API_URL || 'mock mode'}`);
});
