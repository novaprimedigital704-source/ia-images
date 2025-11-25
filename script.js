const generateBtn = document.getElementById('generateBtn');
const promptInput = document.getElementById('prompt');
const resultImage = document.getElementById('resultImage');

generateBtn.addEventListener('click', async () => {
  const prompt = promptInput.value.trim();
  if (!prompt) {
    alert('Digite uma ideia para gerar a imagem!');
    return;
  }

  resultImage.src = ''; // Limpa imagem anterior
  generateBtn.textContent = 'Gerando...';
  generateBtn.disabled = true;

  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });

    const data = await response.json();

    if (data.imageUrl) {
      resultImage.src = data.imageUrl;
    } else {
      alert('Erro ao gerar a imagem.');
    }
  } catch (err) {
    console.error(err);
    alert('Erro ao gerar a imagem.');
  } finally {
    generateBtn.textContent = 'Gerar Imagem';
    generateBtn.disabled = false;
  }
});
