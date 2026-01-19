export const generateReport = (data) => {
  const { currentUser, comptes, transactions, chargesFixes, epargnes = [], dettes = [] } = data;
  const aujourdHui = new Date().toLocaleDateString('fr-FR');
  
  const totalEpargnes = (epargnes || []).reduce((acc, e) => {
  const solde = (e.comptesAssocies || []).reduce((total, compteNom) => {
    const compte = comptes.find(c => c.nom === compteNom);
    return total + (compte ? compte.solde : 0);
  }, 0);
  return acc + solde;
}, 0);

const totalDettes = (dettes || []).reduce((acc, d) => acc + (d.restant || 0), 0);
  
  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rapport Financier - ${currentUser} - ${aujourdHui}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }
        .header h1 {
            font-size: 36px;
            margin-bottom: 10px;
        }
        .content {
            padding: 40px;
        }
        .section {
            margin-bottom: 40px;
        }
        .section h2 {
            font-size: 24px;
            color: #667eea;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 3px solid #667eea;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .stat-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 25px;
            border-radius: 15px;
            color: white;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }
        .stat-card h3 {
            font-size: 14px;
            opacity: 0.9;
            margin-bottom: 10px;
        }
        .stat-card .value {
            font-size: 32px;
            font-weight: bold;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            border-radius: 10px;
            overflow: hidden;
        }
        thead {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        th, td {
            padding: 15px;
            text-align: left;
        }
        tbody tr:nth-child(even) {
            background: #f8f9fa;
        }
        .positive { color: #38ef7d; font-weight: bold; }
        .negative { color: #ff6a00; font-weight: bold; }
        .footer {
            background: #f8f9fa;
            padding: 30px;
            text-align: center;
            color: #666;
        }
        @media print {
            body { padding: 0; background: white; }
            .container { box-shadow: none; max-width: 100%; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>💰 Rapport Financier</h1>
            <p><strong>${currentUser}</strong> | ${aujourdHui}</p>
        </div>
        
        <div class="content">
            <div class="section">
                <h2>📊 Vue d'ensemble</h2>
                <div class="stats-grid">
                    <div class="stat-card">
                        <h3>Total Comptes</h3>
                        <div class="value">${comptes.reduce((acc, c) => acc + c.solde, 0).toFixed(2)} €</div>
                    </div>
                    <div class="stat-card">
                        <h3>Épargnes</h3>
                        <div class="value">${totalEpargnes.toFixed(2)} €</div>
                    </div>
                    <div class="stat-card">
                        <h3>Dettes</h3>
                        <div class="value">${totalDettes.toFixed(2)} €</div>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <h2>💳 Comptes bancaires</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Nom</th>
                            <th>Type</th>
                            <th style="text-align: right;">Solde</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${comptes.map(c => `
                            <tr>
                                <td><strong>${c.nom}</strong></td>
                                <td>${c.type === 'courant' ? '💳 Courant' : c.type === 'epargne' ? '💰 Épargne' : '💵 Espèces'}</td>
                                <td style="text-align: right;" class="${c.solde >= 0 ? 'positive' : 'negative'}">${c.solde.toFixed(2)} €</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            <div class="section">
                <h2>📝 Dernières transactions (20)</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Description</th>
                            <th>Catégorie</th>
                            <th style="text-align: right;">Montant</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${transactions
                          .sort((a, b) => new Date(b.date) - new Date(a.date))
                          .slice(0, 20)
                          .map(t => `
                            <tr>
                                <td>${new Date(t.date + 'T12:00:00').toLocaleDateString('fr-FR')}</td>
                                <td><strong>${t.description}</strong></td>
                                <td>${t.categorie || 'Non catégorisé'}</td>
                                <td style="text-align: right;" class="${t.montant >= 0 ? 'positive' : 'negative'}">
                                    ${t.montant >= 0 ? '+' : ''}${t.montant.toFixed(2)} €
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>Mon Portefeuille Pro</strong> - Rapport généré le ${aujourdHui}</p>
        </div>
    </div>
</body>
</html>
  `;
  
  return html;
};