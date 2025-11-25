import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt é obrigatório" });

    const response = await openai.images.generate({
      model: "gpt-image-1",
      prompt,
      size: "1024x1024",
    });

    res.status(200).json({ imageUrl: response.data[0].url });
  } catch (error) {
    console.error("Erro no backend:", error);
    res.status(500).json({ error: "Erro ao gerar imagem. Verifique o backend." });
  }
}
