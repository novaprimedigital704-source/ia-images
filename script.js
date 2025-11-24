function generatePrompt() {
    const idea = document.getElementById("idea").value;
    const style = document.getElementById("style").value;

    if (!idea.trim()) {
        document.getElementById("output").innerText = "Digite uma ideia primeiro.";
        return;
    }

    const prompt = A highly detailed, professional ${style} image. Description: ${idea}. 4K, ultra realistic lighting, cinematic depth.;

    document.getElementById("output").innerText = prompt;
}
