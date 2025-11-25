const generateBtn = document.getElementById("generateBtn");
const promptInput = document.getElementById("prompt");
const resultImg = document.getElementById("generatedImage");

generateBtn.addEventListener("click", async () => {
  const prompt = promptInput.value.trim();
  if (!prompt) return alert("Digite algo para gerar a imagem!");

  generateBtn.disabled = true;
  generateBtn.innerText = "Gerando...";

  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    const data = await response.json();
    if (data.imageUrl) {
      resultImg.src = data.imageUrl;
    } else {
      alert("Erro ao gerar imagem.");
      console.error(data);
    }
  } catch (err) {
    console.error(err);
    alert("Erro ao se comunicar com o backend.");
  }

  generateBtn.disabled = false;
  generateBtn.innerText = "Gerar Imagem";
});
