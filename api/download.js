import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://bbghffltmiqcljuokbgz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJiZ2hmZmx0bWlxY2xqdW9rYmd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2NzIyODgsImV4cCI6MjEwMDI0ODI4OH0.n1mYWDG2803VEbGQ8qyWlCkthtezu-3Yuh-k58bo0xE';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default async function handler(req, res) {
  // Só aceita POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { password, format, beatSlug } = req.body;

  if (!beatSlug) {
    return res.status(400).json({ error: 'Beat não especificado' });
  }

  try {
    // Busca o beat no Supabase
    const { data: beat, error } = await supabase
      .from('beats')
      .select('password, audio_download_mp3, audio_download_wav, title')
      .eq('slug', beatSlug)
      .single();

    if (error || !beat) {
      return res.status(404).json({ error: 'Beat não encontrado' });
    }

    // Verifica a senha
    if (password !== beat.password) {
      return res.status(401).json({ error: 'Senha incorreta' });
    }

    // Links de download
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
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
