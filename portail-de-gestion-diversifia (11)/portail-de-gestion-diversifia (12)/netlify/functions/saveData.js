const { Client } = require('@neondatabase/serverless');

exports.handler = async (event) => {
  // Sécurité CORS et Méthode
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: 'Method Not Allowed' };
  }

  if (!process.env.DATABASE_URL) {
    return { statusCode: 500, headers, body: 'DATABASE_URL missing' };
  }

  const client = new Client(process.env.DATABASE_URL);
  
  try {
    await client.connect();
    const { key, value } = JSON.parse(event.body);

    // Création de la table si elle n'existe pas (sécurité)
    await client.query(`
      CREATE TABLE IF NOT EXISTS app_data (
        key_name TEXT PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Upsert (Insérer ou Mettre à jour)
    const query = `
      INSERT INTO app_data (key_name, data)
      VALUES ($1, $2)
      ON CONFLICT (key_name)
      DO UPDATE SET data = $2, updated_at = NOW();
    `;

    await client.query(query, [key, JSON.stringify(value)]);
    await client.end();

    return { 
      statusCode: 200, 
      headers,
      body: JSON.stringify({ message: "Saved successfully" }) 
    };
  } catch (error) {
    console.error('Database Error:', error);
    await client.end(); // Assurer la fermeture
    return { 
      statusCode: 500, 
      headers,
      body: JSON.stringify({ error: error.toString() }) 
    };
  }
};