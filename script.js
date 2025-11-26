document.addEventListener('DOMContentLoaded', () => {
    const generateButton = document.getElementById('generateButton');
    const userInput = document.getElementById('userInput');
    const styleButtons = document.querySelectorAll('.style-button');
    const resultArea = document.getElementById('resultArea');
    const loader = document.getElementById('loader');
    const imageContainer = document.getElementById('imageContainer');
    const generatedImage = document.getElementById('generatedImage');
    const outputPrompt = document.getElementById('outputPrompt');
    const copyButton = document.getElementById('copyButton');

    let selectedStyle = 'Fotorealista';

    // -----------------------------
    // 1) PEGAR SESSION_ID DA URL
    // -----------------------------
    const urlParams = new URLSearchParams(window.location.search);
    const session_id = urlParams.get("session_id");

    if (!session_id) {
        alert("Erro: session_id não encontrado. Você veio da página de pagamento?");
        return;
    }

    // -----------------------------
    // 2) BUSCAR CRÉDITOS DO USUÁRIO
    // -----------------------------
    async function loadCredits() {
        try {
            const res = await fetch(`/api/credits?session_id=${session_id}`);
            const data = await res.json();
            console.log("Créditos:", data);
        } catch (e) {
            console.error("Erro ao carregar créditos:", e);
        }
    }

    loadCredits();

    // Seleção de estilos
    styleButtons.forEach(button => {
        button.addEventListener('click', event => {
            styleButtons.forEach(btn => btn.classList.remove('active'));
            const clickedButton = event.currentTarget;
            clickedButton.classList.add('active');
            selectedStyle = clickedButton.dataset.style;
        });
    });

    // -----------------------------
    // GERAR IMAGEM
    // -----------------------------
    generateButton.addEventListener('click', async () => {
        const userIdea = userInput.value.trim();
        if (!userIdea)
            return alert('Por favor, descreva sua ideia antes de gerar a imagem.');

        const professionalPrompt = `masterpiece, best quality, ultra-detailed, ${selectedStyle} style, ${userIdea}`;
        outputPrompt.value = professionalPrompt;

        resultArea.classList.remove('hidden');
        loader.classList.remove('hidden');
        imageContainer.classList.add('hidden');

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: professionalPrompt,
                    session_id
                })
            });

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            generatedImage.src = data.imageUrl;

            loader.classList.add('hidden');
            imageContainer.classList.remove('hidden');

        } catch (error) {
            loader.classList.add('hidden');
            alert('Erro ao gerar a imagem: ' + error.message);
        }
    });

    // COPIAR PROMPT
    copyButton.addEventListener('click', () => {
        outputPrompt.select();
        document.execCommand('copy');
        copyButton.textContent = 'Copiado!';
        setTimeout(() => {
            copyButton.textContent = 'Copiar Prompt';
        }, 2000);
    });
});
