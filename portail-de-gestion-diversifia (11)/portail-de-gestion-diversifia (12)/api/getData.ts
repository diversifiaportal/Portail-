
import { Client } from '@neondatabase/serverless';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Gestion CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { key } = req.query;
  if (!key) return res.status(400).json({ error: 'Key is required' });

  if (!process.env.DATABASE_URL) {
    return res.status(500).json({ error: 'DATABASE_URL not configured in Vercel' });
  }

  const client = new Client(process.env.DATABASE_URL);

  try {
    await client.connect();
    
    // Vérification/Création silencieuse de la table
    await client.query(`
      CREATE TABLE IF NOT EXISTS app_data (
        key_name TEXT PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const result = await client.query('SELECT data FROM app_data WHERE key_name = $1', [key]);
    await client.end();

    if (result.rows.length === 0) {
      return res.status(200).json(null);
    }

    return res.status(200).json(result.rows[0].data);
  } catch (error: any) {
    console.error('Database Error:', error);
    try { await client.end(); } catch (e) {}
    return res.status(500).json({ error: error.message });
  }
}
