document.addEventListener('DOMContentLoaded', () => {
    const generateButton = document.getElementById('generateButton');
    const userInput = document.getElementById('userInput');
    const outputPrompt = document.getElementById('outputPrompt');
    const styleButtons = document.querySelectorAll('.style-button');

    let selectedStyle = 'Fotorealista'; // Estilo padrão

    styleButtons.forEach(button => {
        button.addEventListener('click', () => {
            styleButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            selectedStyle = button.dataset.style;
        });
    });

    if (generateButton) {
        generateButton.addEventListener('click', async () => {
            const userIdea = userInput.value;
            if (!userIdea) {
                alert('Por favor, descreva sua ideia.');
                return;
            }

            // Simula a criação do prompt profissional
            const professionalPrompt = masterpiece, best quality, ultra-detailed, ${selectedStyle}, ${userIdea};
            outputPrompt.value = professionalPrompt;

            // Aqui viria a chamada para a API de imagem
            // Por enquanto, apenas mostramos o prompt
        });
    } else {
        console.error('Botão de gerar não encontrado.');
    }
});
