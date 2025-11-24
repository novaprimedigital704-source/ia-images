document.addEventListener('DOMContentLoaded', () => {
    const userInput = document.getElementById('userInput');
    const styleButtons = document.querySelectorAll('.style-button');
    const createButton = document.getElementById('createButton');
    const outputPrompt = document.getElementById('outputPrompt');
    const copyButton = document.getElementById('copyButton');
    let selectedStyle = null;

    styleButtons.forEach(btn => btn.addEventListener('click', () => {
        styleButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedStyle = btn.dataset.style;
    }));

    createButton.addEventListener('click', async () => {
        const prompt = userInput.value.trim();
        if (!prompt) return alert('Digite uma ideia!');
        if (!selectedStyle) return alert('Selecione um estilo!');

        try {
            const res = await fetch('/api/generate', {
                method:'POST',
                headers:{'Content-Type':'application/json'},
                body: JSON.stringify({ prompt, style: selectedStyle })
            });
            const data = await res.json();
            outputPrompt.value = data.image_url;
        } catch(err){
            console.error('ERRO:', err);
            alert('Erro ao gerar imagem. Verifique o backend.');
        }
    });

    copyButton.addEventListener('click', () => {
        outputPrompt.select();
        document.execCommand('copy');
        copyButton.textContent = 'Copiado!';
        setTimeout(()=>{ copyButton.textContent='Copiar URL'; },2000);
    });
});
