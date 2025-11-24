function generateImage() {
    const prompt = document.getElementById("prompt").value;

    const result = document.getElementById("result");
    result.innerHTML = "<p>Generating image...</p>";

    setTimeout(() => {
        result.innerHTML = `<img src="https://picsum.photos/600?random=${Math.random()}" />`;
    }, 1500);
}