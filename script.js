let selectedStyle = null;

document.querySelectorAll('.style-button').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.style-button').forEach(b => b.classList.remove('active'));
    button.classList.add('active');
    selectedStyle = button.dataset.style;
  });
});

async function generateImage() {
  const promptText = document.getElementById("userInput").value.trim();
  const output = document.getElementById("outputPrompt");
  if (!promptText) return alert("Digite um prompt!");
  if (!selectedStyle) return alert("Selecione um estilo!");

  output.value = "Gerando imagem...";

  try {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: ${promptText}, estilo: ${selectedStyle} }),
    });

    const data = await res.json();
    if (data.imageUrl) {
      const outputArea = document.querySelector(".output-area");
      outputArea.querySelectorAll("img").forEach(img => img.remove());

      const imgTag = document.createElement("img");
      imgTag.src = data.imageUrl;
      imgTag.style.maxWidth = "100%";
      imgTag.style.marginTop = "1rem";
      outputArea.appendChild(imgTag);

      output.value = "Pronto! Veja a imagem abaixo.";
    } else {
      output.value = "Erro ao gerar imagem!";
    }
  } catch (err) {
    output.value = "Erro ao conectar com a API!";
    console.error(err);
  }
}

document.getElementById("createButton").addEventListener("click", generateImage);
