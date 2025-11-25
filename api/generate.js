export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Método não permitido." });
    }

    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: "O prompt é obrigatório." });
        }

        const HF_TOKEN = process.env.HUGGINGFACE_TOKEN;

        if (!HF_TOKEN) {
            return res.status(500).json({ error: "HUGGINGFACE_TOKEN não configurado." });
        }

        // Modelo pode ser alterado (diffusion, flux etc.)
        const MODEL = "black-forest-labs/FLUX.1-schnell";

        const response = await fetch(
            `https://api-inference.huggingface.co/models/${MODEL}`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${HF_TOKEN}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    inputs: prompt
                })
            }
        );

        // buffer da imagem
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // converte para base64
        const base64 = buffer.toString("base64");

        return res.status(200).json({
            imageUrl: `data:image/png;base64,${base64}`
        });

    } catch (error) {
        console.error("Erro no backend:", error);
        return res.status(500).json({ error: error.message });
    }
}
