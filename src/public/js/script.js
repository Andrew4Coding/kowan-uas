window.addEventListener("DOMContentLoaded", () => {
    if (typeof SimpleWebAuthnBrowser === 'undefined') {
        console.error("SimpleWebAuthnBrowser not loaded, retrying...");
        setTimeout(() => window.location.reload(), 1000);
        return;
    }
    
    const session = localStorage.getItem("passkeySession");
    if (session) {
        const sessionData = JSON.parse(session);
        if (sessionData.loggedIn && sessionData.username) {
            window.location.href = "/calculator.html";
        }
    }
    
    document.getElementById("registerButton").addEventListener("click", register);
    document.getElementById("loginButton").addEventListener("click", login);
    document.getElementById("username").addEventListener("keypress", (e) => {
        if (e.key === "Enter") login();
    });
});

function showMessage(message, isError = false) {
    const messageElement = document.getElementById("message");
    messageElement.textContent = message;
    messageElement.style.color = isError ? "#dc3545" : "#10b981";
}

async function register() {
    if (typeof SimpleWebAuthnBrowser === 'undefined') {
        showMessage("WebAuthn library not loaded. Please refresh the page.", true);
        return;
    }
    
    const username = document.getElementById("username").value;
    if (!username) {
        showMessage("Please enter a username", true);
        return;
    }

    try {
        const response = await fetch("/api/passkey/registerStart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username }),
        });

        if (!response.ok) {
            throw new Error("User already exists or registration failed");
        }

        const options = await response.json();

        if (options.user && options.user.id) {
            localStorage.setItem("passkeyUserId", options.user.id);
        }
        if (options.challenge) {
            localStorage.setItem("passkeyChallenge", options.challenge);
        }

        const attestationResponse = await SimpleWebAuthnBrowser.startRegistration(options);

        const userId = localStorage.getItem("passkeyUserId");
        const challenge = localStorage.getItem("passkeyChallenge");

        const verificationResponse = await fetch("/api/passkey/registerFinish", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...attestationResponse, userId, challenge }),
        });

        if (verificationResponse.ok) {
            showMessage("✓ Registration successful! You can now sign in.");
        } else {
            showMessage("Registration failed", true);
        }
    } catch (error) {
        showMessage(error.message || "Registration error", true);
    }
}

async function login() {
    if (typeof SimpleWebAuthnBrowser === 'undefined') {
        showMessage("WebAuthn library not loaded. Please refresh the page.", true);
        return;
    }
    
    const username = document.getElementById("username").value;
    if (!username) {
        showMessage("Please enter a username", true);
        return;
    }

    try {
        const response = await fetch("/api/passkey/loginStart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username }),
        });

        if (!response.ok) {
            throw new Error("User not found");
        }

        const options = await response.json();

        if (options.userId) {
            localStorage.setItem("passkeyUserId", options.userId);
        }
        if (options.challenge) {
            localStorage.setItem("passkeyChallenge", options.challenge);
        }

        const assertionResponse = await SimpleWebAuthnBrowser.startAuthentication(options);

        const userId = localStorage.getItem("passkeyUserId");
        const challenge = localStorage.getItem("passkeyChallenge");

        const verificationResponse = await fetch("/api/passkey/loginFinish", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...assertionResponse, userId, challenge }),
        });

        if (verificationResponse.ok) {
            localStorage.setItem("passkeySession", JSON.stringify({
                loggedIn: true,
                username: username,
                loginTime: new Date().toISOString()
            }));
            
            showMessage("✓ Login successful! Redirecting...");
            
            setTimeout(() => {
                window.location.href = "/calculator.html";
            }, 800);
        } else {
            showMessage("Login failed", true);
        }
    } catch (error) {
        showMessage(error.message || "Login error", true);
    }
}
