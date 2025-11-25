// api/generate.js
import OpenAI from "openai";

// Inicializa o cliente da OpenAI com a chave de API que está na Vercel
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Esta é a função que a Vercel vai executar
export default async function handler(req, res) {
  // Verifica se o método da requisição é POST. Se não for, retorna erro.
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    // Pega o prompt que o frontend (script.js) enviou
    const { prompt } = req.body;

    // Validação: se o prompt não foi enviado, retorna um erro.
    if (!prompt) {
      return res.status(400).json({ error: "O prompt é obrigatório." });
    }

    // Gera a imagem usando a API da OpenAI com o modelo correto
    const response = await openai.images.generate({
      model: "dall-e-3", // <-- O MODELO CORRETO
      prompt: prompt,    // O prompt profissional que o frontend montou
      n: 1,              // Queremos gerar apenas 1 imagem
      size: "1024x1024", // O tamanho da imagem
      quality: "standard", // Pode ser "standard" ou "hd"
    });

    // Pega a URL da imagem gerada
    const imageUrl = response.data[0].url;

    // Retorna a URL da imagem para o frontend
    res.status(200).json({ imageUrl: imageUrl });

  } catch (error) {
    // Se qualquer coisa der errado, registra o erro nos logs da Vercel
    console.error("Erro detalhado no backend:", error);

    // Envia uma mensagem de erro genérica para o frontend
    res.status(500).json({ error: "Ocorreu um erro no servidor ao gerar a imagem." });
  }
}
