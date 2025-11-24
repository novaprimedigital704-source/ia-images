document.addEventListener('DOMContentLoaded', () => {
    const userInput = document.getElementById('userInput');
    const styleButtons = document.querySelectorAll('.style-button');
    const createButton = document.getElementById('createButton');
    const outputPrompt = document.getElementById('outputPrompt');

    let selectedStyle = null;

    styleButtons.forEach(button => {
        button.addEventListener('click', () => {
            styleButtons.forEach(b => b.classList.remove('active'));
            button.classList.add('active');
            selectedStyle = button.dataset.style;
        });
    });

    createButton.addEventListener('click', async () => {
        const prompt = userInput.value.trim();
        if(!prompt || !selectedStyle) return alert("Digite sua ideia e escolha um estilo!");

        outputPrompt.value = "Gerando imagem...";
        try {
            const res = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt, style: selectedStyle })
            });
            const data = await res.json();
            if(data.imageUrl) {
                outputPrompt.value = data.imageUrl;
            } else {
                outputPrompt.value = "Erro ao gerar imagem!";
            }
        } catch(err) {
            outputPrompt.value = "Erro ao gerar imagem!";
            console.error(err);
        }
    });
});
