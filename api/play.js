const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://bbghffltmiqcljuokbgz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJiZ2hmZmx0bWlxY2xqdW9rYmd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2NzIyODgsImV4cCI6MjEwMDI0ODI4OH0.n1mYWDG2803VEbGQ8qyWlCkthtezu-3Yuh-k58bo0xE';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

module.exports = async function handler(req, res) {
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
    const { beatId } = req.body;

    if (!beatId) {
      return res.status(400).json({ error: 'beatId é obrigatório' });
    }

    const { data, error } = await supabase
      .from('beats')
      .select('plays')
      .eq('id', beatId)
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    const currentPlays = data?.plays || 0;
    const newPlays = currentPlays + 1;

    const { error: updateError } = await supabase
      .from('beats')
      .update({ plays: newPlays })
      .eq('id', beatId);

    if (updateError) {
      return res.status(500).json({ error: updateError.message });
    }

    return res.status(200).json({ success: true, plays: newPlays });
  } catch (error) {
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
