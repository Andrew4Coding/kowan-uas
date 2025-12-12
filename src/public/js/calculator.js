// Check if user is logged in
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

    // Display username
    document.getElementById("usernameDisplay").textContent = sessionData.username;
});

// Logout functionality
document.getElementById("logoutButton").addEventListener("click", () => {
    localStorage.removeItem("passkeySession");
    window.location.href = "/";
});

// Calculate circle area
document.getElementById("calculateButton").addEventListener("click", calculateArea);

// Allow Enter key to calculate
document.getElementById("radius").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        calculateArea();
    }
});

function calculateArea() {
    const radiusInput = document.getElementById("radius");
    const resultDiv = document.getElementById("result");
    const messageDiv = document.getElementById("message");

    // Clear previous messages
    messageDiv.textContent = "";
    messageDiv.style.color = "";

    const radius = parseFloat(radiusInput.value);

    if (isNaN(radius) || radius <= 0) {
        showMessage("Please enter a valid positive number for radius", true);
        resultDiv.innerHTML = "";
        return;
    }

    // Calculate area: π × r²
    const area = Math.PI * radius * radius;

    // Display result
    resultDiv.innerHTML = `
        <h3>Result:</h3>
        <p><strong>Radius:</strong> ${radius.toFixed(2)}</p>
        <p><strong>Area:</strong> ${area.toFixed(2)} square units</p>
        <p class="area-large">${area.toFixed(4)}</p>
    `;

    showMessage("Calculation complete!", false);
}

function showMessage(message, isError = false) {
    const messageElement = document.getElementById("message");
    messageElement.textContent = message;
    messageElement.style.color = isError ? "red" : "green";
}
