document.addEventListener('DOMContentLoaded', () => {
    // --- 1. SELEÇÃO DOS ELEMENTOS DA PÁGINA ---
    const generateButton = document.getElementById('generateButton');
    const userInput = document.getElementById('userInput');
    const styleButtons = document.querySelectorAll('.style-button');
    
    // Novos elementos da área de resultado
    const resultArea = document.getElementById('resultArea');
    const loader = document.getElementById('loader');
    const imageContainer = document.getElementById('imageContainer');
    const generatedImage = document.getElementById('generatedImage');
    const outputPrompt = document.getElementById('outputPrompt');
    const copyButton = document.getElementById('copyButton');

    let selectedStyle = 'Fotorealista'; // Estilo padrão inicial

    // --- 2. LÓGICA PARA SELEÇÃO DE ESTILO ---
    styleButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove a classe 'active' de todos os botões
            styleButtons.forEach(btn => btn.classList.remove('active'));
            // Adiciona a classe 'active' ao botão clicado
            button.classList.add('active');
            // Atualiza o estilo selecionado
            selectedStyle = button.dataset.style;
        });
    });

    // --- 3. A MÁGICA DA SIMULAÇÃO AO CLICAR EM "GERAR IMAGEM" ---
    generateButton.addEventListener('click', () => {
        const userIdea = userInput.value;
        if (!userIdea) {
            alert('Por favor, descreva sua ideia antes de gerar a imagem.');
            return;
        }

        // Mostra a área de resultado e a animação de loading
        resultArea.classList.remove('hidden');
        loader.classList.remove('hidden');
        imageContainer.classList.add('hidden'); // Esconde a imagem anterior, se houver

        // Simula o tempo de processamento da IA (3 segundos)
        setTimeout(() => {
            // Monta o prompt profissional
            const professionalPrompt = masterpiece, best quality, ultra-detailed, ${selectedStyle} style, ${userIdea};
            
            // Define a imagem de demonstração e o prompt final
            generatedImage.src = 'https://i.imgur.com/8p5g2cW.png'; // URL da nossa imagem de demonstração
            outputPrompt.value = professionalPrompt;

            // Esconde a animação de loading
            loader.classList.add('hidden' );
            // Mostra o container da imagem
            imageContainer.classList.remove('hidden');

        }, 3000); // 3000 milissegundos = 3 segundos
    });

    // --- 4. FUNCIONALIDADE DO BOTÃO "COPIAR PROMPT" ---
    copyButton.addEventListener('click', () => {
        outputPrompt.select();
        document.execCommand('copy');
        copyButton.textContent = 'Copiado!';
        setTimeout(() => {
            copyButton.textContent = 'Copiar Prompt';
        }, 2000); // Volta ao texto original depois de 2 segundos
    });
});
