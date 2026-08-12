import { createClient } from '@supabase/supabase-js';

    const SUPABASE_URL = 'https://bbghffltmiqcljuokbgz.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJiZ2hmZmx0bWlxY2xqdW9rYmd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2NzIyODgsImV4cCI6MjEwMDI0ODI4OH0.n1mYWDG2803VEbGQ8qyWlCkthtezu-3Yuh-k58bo0xE';

    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


export default async function handler(req, res) {
  const { data, error } = await supabase.from('beats').select('*').order('id', { ascending: false });
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  return res.status(200).json(data);
}
