import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
    try {
        const { prompt, style } = req.body;

        const stylePrompts = {
            photorealistic: ', photorealistic, 8k, sharp focus',
            fantasy_art: ', fantasy art, epic, concept art',
            anime: ', anime style, vibrant colors',
            '3d_model': ', 3D model, Blender render, 4k',
            cinematic: ', cinematic still, film grain',
            cyberpunk: ', cyberpunk, neon lights',
            pixel_art: ', pixel art, retro style'
        };

        const finalPrompt = masterpiece, best quality, ultra-detailed, ${prompt}${stylePrompts[style] || ''};

        const response = await openai.images.generate({
            model: "gpt-image-1",
            prompt: finalPrompt,
            size: "1024x1024",
        });

        res.status(200).json({ imageUrl: response.data[0].url });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro ao gerar a imagem" });
    }
}
