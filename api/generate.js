import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // defina na Vercel
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "O prompt é obrigatório." });
    }

    // 🔥 Geração de imagem com o modelo correto
    const response = await client.images.generate({
      model: "gpt-image-1",   // modelo correto do novo SDK
      prompt: prompt,
      size: "1024x1024"
    });

    // 📌 A imagem vem como base64 agora
    const imageBase64 = response.data[0].b64_json;

    if (!imageBase64) {
      throw new Error("A API não retornou imagem.");
    }

    // 🔗 Criando uma URL de imagem acessível no frontend
    const imageUrl = `data:image/png;base64,${imageBase64}`;

    return res.status(200).json({ imageUrl });

  } catch (error) {
    console.error("Erro no backend:", error);
    return res.status(500).json
