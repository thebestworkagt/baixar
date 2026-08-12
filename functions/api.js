const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://bbghffltmiqcljuokbgz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJiZ2hmZmx0bWlxY2xqdW9rYmd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2NzIyODgsImV4cCI6MjEwMDI0ODI4OH0.n1mYWDG2803VEbGQ8qyWlCkthtezu-3Yuh-k58bo0xE';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Extrair a rota real do path
  // Exemplo: "/.netlify/functions/api/beats" → "/api/beats"
  let path = event.path;
  if (path.includes('/.netlify/functions/api/')) {
    path = path.replace('/.netlify/functions/api/', '/api/');
  } else if (path.includes('/api/')) {
    path = path;
  } else {
    path = '/' + path.split('/').pop();
  }

  console.log('🔍 Rota processada:', path);

  // ============================================================
  // ROTA: /api/beats (GET)
  // ============================================================
  if (path === '/api/beats' && event.httpMethod === 'GET') {
    try {
      const { data, error } = await supabase
        .from('beats')
        .select('*')
        .order('id', { ascending: false });

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
  }

  // ============================================================
  // ROTA: /api/play (POST)
  // ============================================================
  if (path === '/api/play' && event.httpMethod === 'POST') {
    try {
      const { beatId } = JSON.parse(event.body);

      if (!beatId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'beatId é obrigatório' })
        };
      }

      const { data, error } = await supabase
        .from('beats')
        .select('plays')
        .eq('id', beatId)
        .single();

      if (error) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: error.message })
        };
      }

      const currentPlays = data?.plays || 0;
      const newPlays = currentPlays + 1;

      const { error: updateError } = await supabase
        .from('beats')
        .update({ plays: newPlays })
        .eq('id', beatId);

      if (updateError) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: updateError.message })
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, plays: newPlays })
      };
    } catch (error) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Erro interno do servidor' })
      };
    }
  }

  // ============================================================
  // ROTA: /api/ratings (GET)
  // ============================================================
  if (path === '/api/ratings' && event.httpMethod === 'GET') {
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
  }

  // ============================================================
  // ROTA: /api/rate (POST)
  // ============================================================
  if (path === '/api/rate' && event.httpMethod === 'POST') {
    try {
      const { beatId, rating, userId } = JSON.parse(event.body);

      if (!beatId || !rating) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'beatId e rating são obrigatórios' })
        };
      }

      if (rating < 1 || rating > 5) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Rating deve ser entre 1 e 5' })
        };
      }

      const { error } = await supabase
        .from('ratings')
        .insert([{
          beat_id: beatId,
          rating: rating,
          user_id: userId || 'anonymous'
        }]);

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
        body: JSON.stringify({ success: true, message: 'Avaliação enviada!' })
      };
    } catch (error) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Erro interno do servidor' })
      };
    }
  }

  // ============================================================
  // ROTA: /api/download (POST)
  // ============================================================
  if (path === '/api/download' && event.httpMethod === 'POST') {
    try {
      const { password, format, beatSlug } = JSON.parse(event.body);

      if (!beatSlug) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Beat não especificado' })
        };
      }

      const { data: beat, error } = await supabase
        .from('beats')
        .select('password, audio_download_mp3, audio_download_wav, title')
        .eq('slug', beatSlug)
        .maybeSingle();

      if (error || !beat) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Beat não encontrado' })
        };
      }

      if (password !== beat.password) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Senha incorreta' })
        };
      }

      const DOWNLOAD_LINKS = {
        mp3: beat.audio_download_mp3,
        wav: beat.audio_download_wav
      };

      if (!DOWNLOAD_LINKS[format]) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Formato inválido' })
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          url: DOWNLOAD_LINKS[format],
          filename: `${beat.title.replace(/\s/g, '_')}.${format}`
        })
      };
    } catch (error) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Erro interno do servidor' })
      };
    }
  }

  // ============================================================
  // ROTA PADRÃO (404)
  // ============================================================
  return {
    statusCode: 404,
    headers,
    body: JSON.stringify({
      error: 'Rota não encontrada',
      path: path,
      method: event.httpMethod
    })
  };
};
