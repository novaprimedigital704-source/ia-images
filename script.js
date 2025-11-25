document.addEventListener('DOMContentLoaded', () => {
    // --- 1. SELEÇÃO DOS ELEMENTOS ---
    const generateButton = document.getElementById('generateButton');
    const userInput = document.getElementById('userInput');
    const styleButtons = document.querySelectorAll('.style-button');
    
    const resultArea = document.getElementById('resultArea');
    const loader = document.getElementById('loader');
    const imageContainer = document.getElementById('imageContainer');
    const generatedImage = document.getElementById('generatedImage');
    const outputPrompt = document.getElementById('outputPrompt');
    const copyButton = document.getElementById('copyButton');

    // --- 2. ESTILO SELECIONADO ---
    let selectedStyle = 'Fotorealista';

    styleButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            styleButtons.forEach(btn => btn.classList.remove('active'));

            const clickedButton = event.currentTarget;
            clickedButton.classList.add('active');

            selectedStyle = clickedButton.dataset.style;
        });
    });

    // --- 3. SIMULAÇÃO DE GERAÇÃO ---
    generateButton.addEventListener('click', () => {
        const userIdea = userInput.value.trim();

        if (!userIdea) {
            alert('Por favor, descreva sua ideia antes de gerar a imagem.');
            return;
        }

        resultArea.classList.remove('hidden');
        loader.classList.remove('hidden');
        imageContainer.classList.add('hidden');

        setTimeout(() => {
            const professionalPrompt = `masterpiece, best quality, ultra-detailed, ${selectedStyle} style, ${userIdea}`;

            generatedImage.src = 'https://i.imgur.com/8p5g2cW.png';
            outputPrompt.value = professionalPrompt;

            loader.classList.add('hidden');
            imageContainer.classList.remove('hidden');

        }, 3000);
    });

    // --- 4. COPIAR PROMPT ---
    copyButton.addEventListener('click', () => {
        outputPrompt.select();
        document.execCommand('copy');

        copyButton.textContent = 'Copiado!';
        setTimeout(() => {
            copyButton.textContent = 'Copiar Prompt';
        }, 2000);
    });
});
