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

        // 🔥 MODELO GRATUITO QUE FUNCIONA
        const MODEL = "stabilityai/stable-diffusion-xl-base-1.0";

        const response = await fetch(
            `https://api-inference.huggingface.co/models/${MODEL}`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${HF_TOKEN}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ inputs: prompt })
            }
        );

        if (!response.ok) {
            const errorTxt = await response.text();
            throw new Error("Erro da HuggingFace: " + errorTxt);
        }

        const arrayBuffer = await response.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString("base64");

        return res.status(200).json({
            imageUrl: `data:image/png;base64,${base64}`
        });

    } catch (error) {
        console.error("Erro no backend:", error);
        return res.status(500).json({ error: error.message });
    }
}
