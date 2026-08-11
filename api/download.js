// api/download.js
// Usando require em vez de import (mais compatível)

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://bbghffltmiqcljuokbgz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJiZ2hmZmx0bWlxY2xqdW9rYmd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2NzIyODgsImV4cCI6MjEwMDI0ODI4OH0.n1mYWDG2803VEbGQ8qyWlCkthtezu-3Yuh-k58bo0xE';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

module.exports = async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { password, format, beatSlug } = req.body;

    if (!beatSlug) {
      return res.status(400).json({ error: 'Beat não especificado' });
    }

    // Busca o beat no Supabase
    const { data: beat, error } = await supabase
      .from('beats')
      .select('password, audio_download_mp3, audio_download_wav, title')
      .eq('slug', beatSlug)
      .maybeSingle();

    if (error) {
      console.error('Erro Supabase:', error);
      return res.status(500).json({ error: 'Erro ao buscar beat: ' + error.message });
    }

    if (!beat) {
      return res.status(404).json({ error: 'Beat não encontrado' });
    }

    if (password !== beat.password) {
      return res.status(401).json({ error: 'Senha incorreta' });
    }

    const DOWNLOAD_LINKS = {
      mp3: beat.audio_download_mp3,
      wav: beat.audio_download_wav
    };

    if (!DOWNLOAD_LINKS[format]) {
      return res.status(400).json({ error: 'Formato inválido' });
    }

    return res.status(200).json({
      success: true,
      url: DOWNLOAD_LINKS[format],
      filename: `${beat.title.replace(/\s/g, '_')}.${format}`
    });

  } catch (error) {
    console.error('Erro:', error);
    return res.status(500).json({ error: 'Erro interno: ' + error.message });
  }
};
