export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { item_id, user_id } = req.query;

    if (!item_id || !user_id) {
      return res.status(400).json({ error: 'Paramètres manquants' });
    }

    // Rediriger vers l'app avec les paramètres
    const redirectUrl = `${process.env.VERCEL_URL || 'http://localhost:3000'}?bridge_item_id=${item_id}&bridge_user_id=${user_id}&bridge_status=success`;
    
    return res.redirect(redirectUrl);

  } catch (error) {
    console.error('Erreur Bridge Callback:', error);
    const errorUrl = `${process.env.VERCEL_URL || 'http://localhost:3000'}?bridge_status=error`;
    return res.redirect(errorUrl);
  }
}