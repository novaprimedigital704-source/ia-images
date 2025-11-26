document.addEventListener("DOMContentLoaded", () => {
    const userEmailInput = document.getElementById("userEmail");
    const creditInfo = document.getElementById("creditInfo");
    const generateButton = document.getElementById("generateButton");
    const buyButtons = document.querySelectorAll(".buy-button");

    let credits = 0;
    let selectedStyle = "Fotorealista";

    // Seleção de estilo
    const styleButtons = document.querySelectorAll(".style-button");
    styleButtons.forEach(button => {
        button.addEventListener("click", e => {
            styleButtons.forEach(b => b.classList.remove("active"));
            e.target.classList.add("active");
            selectedStyle = e.target.dataset.style;
        });
    });

    // Buscar créditos
    async function loadCredits() {
        const email = userEmailInput.value.trim();
        if (!email) return;

        const res = await fetch("/api/credits", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        });

        const data = await res.json();
        credits = data.credits;

        creditInfo.textContent = `Créditos: ${credits}`;

        if (credits <= 0) {
            generateButton.disabled = true;
            generateButton.textContent = "Sem créditos - Comprar plano";
            generateButton.classList.add("no-credits");
        } else {
            generateButton.disabled = false;
            generateButton.textContent = "Gerar Imagem";
            generateButton.classList.remove("no-credits");
        }
    }

    userEmailInput.addEventListener("input", loadCredits);

    // CLICK NO BOTÃO DE GERAR
    generateButton.addEventListener("click", async () => {
        if (credits <= 0) {
            document.getElementById("plans").scrollIntoView({ behavior: "smooth" });
            return;
        }

        const prompt = document.getElementById("userInput").value.trim();
        if (!prompt) return alert("Digite uma ideia.");

        const professional = `masterpiece, ultra detailed, ${selectedStyle}, ${prompt}`;

        document.getElementById("outputPrompt").value = professional;

        // Mostra loader
        document.getElementById("resultArea").classList.remove("hidden");
        document.getElementById("loader").classList.remove("hidden");
        document.getElementById("imageContainer").classList.add("hidden");

        const email = userEmailInput.value.trim();

        const response = await fetch("/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: professional, email })
        });

        const data = await response.json();

        // Oculta loader
        document.getElementById("loader").classList.add("hidden");

        if (data.error) {
            alert(data.error);
            return;
        }

        document.getElementById("generatedImage").src = data.imageUrl;
        document.getElementById("imageContainer").classList.remove("hidden");

        credits = data.credits;
        creditInfo.textContent = `Créditos: ${credits}`;

        if (credits <= 0) {
            generateButton.disabled = true;
            generateButton.textContent = "Sem créditos - Comprar plano";
            setTimeout(() => {
                document.getElementById("plans").scrollIntoView({ behavior: "smooth" });
            }, 800);
        }
    });

    // COPIAR PROMPT
    document.getElementById("copyButton").addEventListener("click", () => {
        const text = document.getElementById("outputPrompt");
        text.select();
        document.execCommand("copy");
    });

    // BOTÕES DE COMPRA
    buyButtons.forEach(btn => {
        btn.addEventListener("click", async () => {
            const priceId = btn.dataset.price; // CORRIGIDO
            const email = userEmailInput.value.trim();

            if (!email) return alert("Digite seu email para comprar.");

            const res = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ priceId, email })
            });

            const data = await res.json();

            if (data.url) {
                window.location.href = data.url;
            } else {
                alert("Erro: " + data.error);
            }
        });
    });
});
