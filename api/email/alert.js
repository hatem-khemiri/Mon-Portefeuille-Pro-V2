import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { count, threshold, maxUsers } = req.body;

    const percentage = ((count / maxUsers) * 100).toFixed(1);
    
    let subject = '';
    let message = '';
    let priority = '';

    if (threshold === 25) {
      subject = '⚠️ [Mon Portefeuille Pro] 25% de la limite atteinte';
      message = `Vous avez atteint 25% de la limite de connexions bancaires (${count}/${maxUsers}).`;
      priority = 'info';
    } else if (threshold === 50) {
      subject = '⚠️ [Mon Portefeuille Pro] 50% de la limite atteinte';
      message = `Vous avez atteint 50% de la limite de connexions bancaires (${count}/${maxUsers}).`;
      priority = 'warning';
    } else if (threshold === 75) {
      subject = '🚨 [Mon Portefeuille Pro] 75% de la limite atteinte';
      message = `Vous avez atteint 75% de la limite de connexions bancaires (${count}/${maxUsers}). Envisagez de passer au plan payant.`;
      priority = 'warning';
    } else if (threshold === 90) {
      subject = '🚨 [Mon Portefeuille Pro] 90% de la limite atteinte !';
      message = `ATTENTION : Vous avez atteint 90% de la limite (${count}/${maxUsers}). Les nouvelles connexions seront bloquées à 95.`;
      priority = 'critical';
    } else if (threshold === 95) {
      subject = '🔴 [Mon Portefeuille Pro] LIMITE CRITIQUE - 95% atteinte !';
      message = `CRITIQUE : Vous avez atteint 95% de la limite (${count}/${maxUsers}). Les nouvelles connexions sont maintenant BLOQUÉES. Passez au plan payant immédiatement.`;
      priority = 'critical';
    }

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { background: ${priority === 'critical' ? '#dc2626' : priority === 'warning' ? '#f59e0b' : '#3b82f6'}; color: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; }
          .stats { background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .progress-bar { width: 100%; height: 30px; background: #e5e7eb; border-radius: 15px; overflow: hidden; margin: 10px 0; }
          .progress-fill { height: 100%; background: ${priority === 'critical' ? '#dc2626' : priority === 'warning' ? '#f59e0b' : '#3b82f6'}; transition: width 0.3s; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${subject}</h1>
          </div>
          <p>${message}</p>
          <div class="stats">
            <h3>Statistiques actuelles :</h3>
            <p><strong>Utilisateurs connectés :</strong> ${count} / ${maxUsers}</p>
            <p><strong>Pourcentage :</strong> ${percentage}%</p>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${percentage}%"></div>
            </div>
          </div>
          ${threshold >= 90 ? `
            <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
              <h3 style="color: #dc2626;">⚠️ Action requise</h3>
              <p>Pour éviter toute interruption de service, veuillez passer au plan Bridge Pro (99€/mois pour 500 utilisateurs).</p>
              <a href="https://dashboard.bridgeapi.io/billing" style="display: inline-block; background: #dc2626; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">Mettre à niveau maintenant</a>
            </div>
          ` : ''}
          <div class="footer">
            <p>Mon Portefeuille Pro - Système d'alertes automatique</p>
            <p>Cet email a été envoyé automatiquement. Ne pas répondre.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await resend.emails.send({
      from: 'Mon Portefeuille Pro <onboarding@resend.dev>',
      to: process.env.ALERT_EMAIL,
      subject: subject,
      html: emailHtml
    });

    return res.status(200).json({ success: true, message: 'Alerte envoyée' });

  } catch (error) {
    console.error('Erreur Email Alert:', error);
    return res.status(500).json({ error: 'Erreur envoi email' });
  }
}