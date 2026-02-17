const { Client } = require('@neondatabase/serverless');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (!process.env.DATABASE_URL) {
    return { statusCode: 500, headers, body: 'DATABASE_URL missing' };
  }

  const client = new Client(process.env.DATABASE_URL);

  try {
    await client.connect();
    const { key } = event.queryStringParameters;

    // Vérifier si la table existe avant de requêter
    const checkTable = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'app_data'
      );
    `);

    if (!checkTable.rows[0].exists) {
        await client.end();
        return { statusCode: 200, headers, body: JSON.stringify(null) };
    }

    const result = await client.query('SELECT data FROM app_data WHERE key_name = $1', [key]);
    await client.end();

    if (result.rows.length === 0) {
        return { statusCode: 200, headers, body: JSON.stringify(null) };
    }

    return { 
        statusCode: 200, 
        headers,
        body: JSON.stringify(result.rows[0].data) 
    };
  } catch (error) {
    console.error('Database Error:', error);
    await client.end();
    return { 
        statusCode: 500, 
        headers,
        body: JSON.stringify({ error: error.toString() }) 
    };
  }
};