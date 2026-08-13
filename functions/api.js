const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://bbghffltmiqcljuokbgz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJiZ2hmZmx0bWlxY2xqdW9rYmd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2NzIyODgsImV4cCI6MjEwMDI0ODI4OH0.n1mYWDG2803VEbGQ8qyWlCkthtezu-3Yuh-k58bo0xE';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Extrair a rota real do path
  let path = event.path;
  if (path.includes('/.netlify/functions/api/')) {
    path = path.replace('/.netlify/functions/api/', '/api/');
  } else if (path.includes('/api/')) {
    path = path;
  } else {
    path = '/' + path.split('/').pop();
  }

  console.log('🔍 Rota:', path, 'Método:', event.httpMethod);

  // ============================================================
  // ROTA: /api/beats (GET) - Listar beats
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
  // ROTA: /api/beats (POST) - CRIAR NOVO BEAT (ADMIN)
  // ============================================================
  if (path === '/api/beats' && event.httpMethod === 'POST') {
    try {
      const beatData = JSON.parse(event.body);
      
      // Gerar slug automaticamente
      if (!beatData.slug) {
        beatData.slug = beatData.title
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
      }

      const { data, error } = await supabase
        .from('beats')
        .insert([beatData])
        .select();

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
        body: JSON.stringify({ success: true, data: data })
      };
    } catch (error) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: error.message || 'Erro interno do servidor' })
      };
    }
  }

  // ============================================================
  // ROTA: /api/beats/:id (PUT) - EDITAR BEAT (ADMIN)
  // ============================================================
  if (path.startsWith('/api/beats/') && event.httpMethod === 'PUT') {
    try {
      const id = path.replace('/api/beats/', '');
      const beatData = JSON.parse(event.body);
      
      // Remover campos que não devem ser atualizados
      delete beatData.id;
      delete beatData.created_at;
      delete beatData.plays;

      const { data, error } = await supabase
        .from('beats')
        .update(beatData)
        .eq('id', id)
        .select();

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
        body: JSON.stringify({ success: true, data: data })
      };
    } catch (error) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: error.message || 'Erro interno do servidor' })
      };
    }
  }

  // ============================================================
  // ROTA: /api/beats/:id (DELETE) - APAGAR BEAT (ADMIN)
  // ============================================================
  if (path.startsWith('/api/beats/') && event.httpMethod === 'DELETE') {
    try {
      const id = path.replace('/api/beats/', '');
      
      const { error } = await supabase
        .from('beats')
        .delete()
        .eq('id', id);

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
        body: JSON.stringify({ success: true })
      };
    } catch (error) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: error.message || 'Erro interno do servidor' })
      };
    }
  }

  // ============================================================
  // ROTA: /api/login (POST) - LOGIN ADMIN
  // ============================================================
  if (path === '/api/login' && event.httpMethod === 'POST') {
    try {
      const { email, password } = JSON.parse(event.body);
      
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Email ou senha inválidos' })
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true, 
          user: {
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.name || 'Administrador'
          }
        })
      };
    } catch (error) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: error.message || 'Erro interno do servidor' })
      };
    }
  }

  // ============================================================
  // ROTA: /api/logout (POST) - LOGOUT ADMIN
  // ============================================================
  if (path === '/api/logout' && event.httpMethod === 'POST') {
    try {
      await supabase.auth.signOut();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true })
      };
    } catch (error) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: error.message || 'Erro interno do servidor' })
      };
    }
  }

  // ============================================================
  // ROTA: /api/play (POST) - Incrementar plays
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
  // ROTA: /api/ratings (GET) - Listar avaliações
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
  // ROTA: /api/rate (POST) - Enviar avaliação
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
  // ROTA: /api/download (POST) - Download com senha
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
