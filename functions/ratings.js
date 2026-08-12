const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://bbghffltmiqcljuokbgz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJiZ2hmZmx0bWlxY2xqdW9rYmd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2NzIyODgsImV4cCI6MjEwMDI0ODI4OH0.n1mYWDG2803VEbGQ8qyWlCkthtezu-3Yuh-k58bo0xE';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Método não permitido' })
    };
  }

  try {
    const { data, error } = await supabase
      .from('ratings')
      .select('*');

    if (error) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: error.message })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data || [])
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Erro interno do servidor' })
    };
  }
};
