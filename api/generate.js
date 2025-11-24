import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.API_KEY
});

export default async function handler(req, res){
    if(req.method !== "POST") return res.status(405).json({ error: "Método não permitido" });

    const { prompt, style } = req.body;
    if(!prompt) return res.status(400).json({ error: "Prompt obrigatório" });

    try {
        const finalPrompt = masterpiece, best quality, ultra-detailed, ${prompt}, style: ${style};
        const result = await openai.images.generate({
            model:"gpt-image-1",
            prompt: finalPrompt,
            size:"1024x1024"
        });
        res.status(200).json({ image_url: result.data[0].url });
    } catch(err){
        res.status(500).json({ error: err.message });
    }
}
