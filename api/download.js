export default function handler(req, res) {
    // Só aceita POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    const { password, format } = req.body;

    // Senha correta (a sua senha)
    const CORRECT_PASSWORD = 'Thebestwork2026';

    if (password !== CORRECT_PASSWORD) {
        return res.status(401).json({ error: 'Senha incorreta' });
    }

    // Links de download (os seus links)
    const DOWNLOAD_LINKS = {
        mp3: 'https://od.lk/d/MzhfMzQ5NDYwNTJfODM3SXI/Play%20By%20-%20Beat%20Master.mp3',
        wav: 'https://od.lk/d/MzhfMzQ5NDYwNjVfZHNCOU0/Play%20By%20-%20Beat%20Master.wav'
    };

    if (!DOWNLOAD_LINKS[format]) {
        return res.status(400).json({ error: 'Formato inválido' });
    }

    // Retorna o link de download
    return res.status(200).json({
        success: true,
        url: DOWNLOAD_LINKS[format],
        filename: `Love_Beat.${format}`
    });
}
