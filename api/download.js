export default function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Responder preflight (OPTIONS)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Teste: retorna sempre sucesso
  return res.status(200).json({
    success: true,
    message: 'API está funcionando!',
    url: 'https://od.lk/d/MzhfMzQ5NDYwNTJfODM3SXI/Play%20By%20-%20Beat%20Master.mp3',
    filename: 'Love_Beat.mp3'
  });
}
