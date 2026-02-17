
import { Client } from '@neondatabase/serverless';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { key, value } = req.body;
  if (!key) return res.status(400).json({ error: 'Key and value are required' });

  if (!process.env.DATABASE_URL) {
    return res.status(500).json({ error: 'DATABASE_URL not configured in Vercel' });
  }

  const client = new Client(process.env.DATABASE_URL);

  try {
    await client.connect();
    
    // Création de la table si nécessaire
    await client.query(`
      CREATE TABLE IF NOT EXISTS app_data (
        key_name TEXT PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const query = `
      INSERT INTO app_data (key_name, data)
      VALUES ($1, $2)
      ON CONFLICT (key_name)
      DO UPDATE SET data = $2, updated_at = NOW();
    `;

    await client.query(query, [key, JSON.stringify(value)]);
    await client.end();

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Database Error:', error);
    try { await client.end(); } catch (e) {}
    return res.status(500).json({ error: error.message });
  }
}
