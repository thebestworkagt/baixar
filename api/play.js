import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://bbghffltmiqcljuokbgz.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJiZ2hmZmx0bWlxY2xqdW9rYmd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2NzIyODgsImV4cCI6MjEwMDI0ODI4OH0.n1mYWDG2803VEbGQ8qyWlCkthtezu-3Yuh-k58bo0xE';

    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);



export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { beatId } = req.body;

  const { data, error } = await supabase
    .from('beats')
    .select('plays')
    .eq('id', beatId)
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  const newPlays = (data?.plays || 0) + 1;

  const { error: updateError } = await supabase
    .from('beats')
    .update({ plays: newPlays })
    .eq('id', beatId);

  if (updateError) {
    return res.status(500).json({ error: updateError.message });
  }

  return res.status(200).json({ success: true, plays: newPlays });
}
