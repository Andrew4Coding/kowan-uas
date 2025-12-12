window.addEventListener("DOMContentLoaded", () => {
    const session = localStorage.getItem("passkeySession");
    if (!session) {
        window.location.href = "/";
        return;
    }

    const sessionData = JSON.parse(session);
    if (!sessionData.loggedIn || !sessionData.username) {
        window.location.href = "/";
        return;
    }

    document.getElementById("usernameDisplay").textContent = sessionData.username;
});

document.getElementById("logoutButton").addEventListener("click", () => {
    localStorage.removeItem("passkeySession");
    window.location.href = "/";
});

document.getElementById("calculateButton").addEventListener("click", calculateArea);

document.getElementById("radius").addEventListener("keypress", (e) => {
    if (e.key === "Enter") calculateArea();
});

function calculateArea() {
    const radiusInput = document.getElementById("radius");
    const resultDiv = document.getElementById("result");
    const messageDiv = document.getElementById("message");

    messageDiv.textContent = "";
    messageDiv.style.color = "";

    const radius = parseFloat(radiusInput.value);

    if (isNaN(radius) || radius <= 0) {
        showMessage("Please enter a valid positive number", true);
        resultDiv.classList.remove("show");
        return;
    }

    const area = Math.PI * radius * radius;

    resultDiv.innerHTML = `
        <div class="result-header">Calculation Result</div>
        <div class="result-item">
            <span class="result-label">Radius</span>
            <span class="result-value">${radius.toFixed(2)} units</span>
        </div>
        <div class="result-item">
            <span class="result-label">Area</span>
            <span class="result-value">${area.toFixed(2)} sq units</span>
        </div>
        <div class="result-highlight">
            <div class="result-large">${area.toFixed(4)}</div>
        </div>
    `;
    
    resultDiv.classList.add("show");
    showMessage("✓ Calculation complete!", false);
}

function showMessage(message, isError = false) {
    const messageElement = document.getElementById("message");
    messageElement.textContent = message;
    messageElement.style.color = isError ? "#dc3545" : "#10b981";
}
