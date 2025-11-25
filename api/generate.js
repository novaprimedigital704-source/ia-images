module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "O prompt é obrigatório." });
    }

    const hfToken = process.env.HUGGINGFACE_TOKEN;

    if (!hfToken) {
      return res.status(500).json({ error: "HUGGINGFACE_TOKEN não configurado." });
    }

    // Modelo que vamos usar (recomendo FLUX)
    const model = "black-forest-labs/FLUX.1-schnell";

    // Chamando a Inference API da HuggingFace
    const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${hfToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ inputs: prompt })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error("Falha na API HuggingFace: " + errorText);
    }

    // A imagem vem como um blob binário
    const arrayBuffer = await response.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString("base64");

    const imageUrl = `data:image/png;base64,${base64Image}`;

    return res.status(200).json({ imageUrl });

  } catch (error) {
    console.error("Erro no backend:", error);
    return res.status(500).json({ error: error.message });
  }
};
