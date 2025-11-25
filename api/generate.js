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

        // Modelo grátis
        const MODEL = "black-forest-labs/FLUX.1-schnell";

        const response = await fetch(
            `https://router.huggingface.co/hf-inference/models/${MODEL}`,
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

        // Caso a API retorne erro em JSON
        const contentType = response.headers.get("content-type");

        if (contentType && contentType.includes("application/json")) {
            const errorData = await response.json();
            throw new Error("Erro da HuggingFace: " + JSON.stringify(errorData));
        }

        // Recebe a imagem como binário
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Converte para BASE64
        const base64 = buffer.toString("base64");
        const imageUrl = `data:image/png;base64,${base64}`;

        return res.status(200).json({ imageUrl });

    } catch (error) {
        console.error("Erro no backend:", error);
        return res.status(500).json({ error: error.message });
    }
}
