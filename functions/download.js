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

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Método não permitido' })
    };
  }

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
};
