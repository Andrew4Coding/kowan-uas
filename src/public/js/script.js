// Wait for both DOM and SimpleWebAuthn library to load
let isReady = false;
window.addEventListener("DOMContentLoaded", () => {
    // Check if SimpleWebAuthn is loaded
    if (typeof SimpleWebAuthnBrowser === 'undefined') {
        console.error("SimpleWebAuthnBrowser not loaded yet, retrying...");
        setTimeout(() => window.location.reload(), 1000);
        return;
    }
    
    isReady = true;
    
    // Check if user is already logged in
    const session = localStorage.getItem("passkeySession");
    if (session) {
        const sessionData = JSON.parse(session);
        if (sessionData.loggedIn && sessionData.username) {
            window.location.href = "/calculator.html";
        }
    }
    
    // Attach event listeners after DOM is ready
    document.getElementById("registerButton").addEventListener("click", register);
    document.getElementById("loginButton").addEventListener("click", login);
});

function showMessage(message, isError = false) {
    const messageElement = document.getElementById("message");
    messageElement.textContent = message;
    messageElement.style.color = isError ? "red" : "green";
}

async function register() {
    // Check if library is loaded
    if (typeof SimpleWebAuthnBrowser === 'undefined') {
        showMessage("WebAuthn library not loaded. Please refresh the page.", true);
        return;
    }
    
    // Retrieve the username from the input field
    const username = document.getElementById("username").value;

    try {
        // Get registration options from your server. Here, we also receive the challenge.
        const response = await fetch("/api/passkey/registerStart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: username }),
        });
        console.log(response);

        // Check if the registration options are ok.
        if (!response.ok) {
            throw new Error(
                "User already exists or failed to get registration options from server",
            );
        }

        // Convert the registration options to JSON.
        const options = await response.json();
        console.log(options);

        // Store userId in localStorage
        if (options.user && options.user.id) {
            localStorage.setItem("passkeyUserId", options.user.id);
            console.log("Stored userId in localStorage:", options.user.id);
        }

        // This triggers the browser to display the passkey / WebAuthn modal (e.g. Face ID, Touch ID, Windows Hello).
        // A new attestation is created. This also means a new public-private-key pair is created.
        const attestationResponse =
            await SimpleWebAuthnBrowser.startRegistration(options);

        // Get userId from localStorage
        const userId = localStorage.getItem("passkeyUserId");

        // Send attestationResponse back to server for verification and storage.
        const verificationResponse = await fetch("/api/passkey/registerFinish", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...attestationResponse, userId }),
        });

        if (verificationResponse.ok) {
            showMessage("Registration successful! You can now login.");
        } else {
            showMessage("Registration failed", true);
        }
    } catch (error) {
        showMessage("Error: " + error.message, true);
    }
}

async function login() {
    // Check if library is loaded
    if (typeof SimpleWebAuthnBrowser === 'undefined') {
        showMessage("WebAuthn library not loaded. Please refresh the page.", true);
        return;
    }
    
    // Retrieve the username from the input field
    const username = document.getElementById("username").value;

    try {
        // Get login options from your server. Here, we also receive the challenge.
        const response = await fetch("/api/passkey/loginStart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: username }),
        });
        // Check if the login options are ok.
        if (!response.ok) {
            throw new Error("Failed to get login options from server");
        }
        // Convert the login options to JSON.
        const options = await response.json();
        console.log(options);

        // Store userId in localStorage
        if (options.userId) {
            localStorage.setItem("passkeyUserId", options.userId);
            console.log("Stored userId in localStorage:", options.userId);
        }

        // This triggers the browser to display the passkey / WebAuthn modal (e.g. Face ID, Touch ID, Windows Hello).
        // A new assertionResponse is created. This also means that the challenge has been signed.
        const assertionResponse =
            await SimpleWebAuthnBrowser.startAuthentication(options);

        // Get userId from localStorage
        const userId = localStorage.getItem("passkeyUserId");

        // Send assertionResponse back to server for verification.
        const verificationResponse = await fetch("/api/passkey/loginFinish", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...assertionResponse, userId }),
        });

        if (verificationResponse.ok) {
            // Store session in localStorage
            localStorage.setItem("passkeySession", JSON.stringify({
                loggedIn: true,
                username: username,
                loginTime: new Date().toISOString()
            }));
            
            showMessage("Login successful! Redirecting...");
            
            // Redirect to calculator page
            setTimeout(() => {
                window.location.href = "/calculator.html";
            }, 1000);
        } else {
            showMessage("Login failed", true);
        }
    } catch (error) {
        showMessage("Error: " + error.message, true);
    }
}
