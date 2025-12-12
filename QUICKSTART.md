# Quick Start Guide

## Get Started in 3 Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Application with Docker
```bash
docker compose up
```

Wait for both services to start. You should see:
- MySQL database running on port 3306
- Express app running on port 8080

### 3. Open Your Browser
Navigate to: **http://localhost:8080**

## First Time Usage

1. **Register a passkey:**
   - Enter a username (e.g., "testuser")
   - Click "Register"
   - Follow your device's biometric prompt
   - ✅ Success! You've created your first passkey

2. **Login with your passkey:**
   - Enter the same username
   - Click "Login"
   - Complete biometric authentication
   - ✅ You're logged in!

## Alternative: Run Without Docker

If you prefer to run without Docker:

1. **Start MySQL locally** and create `webauthn_db` database
2. **Run the SQL schema** from `init-db.sql`
3. **Set environment variables:**
   ```bash
   export DB_HOST=localhost
   export DB_USER=root
   export DB_PASSWORD=your_password
   export DB_NAME=webauthn_db
   export SESSION_SECRET=secret123
   ```
4. **Start the server:**
   ```bash
   npm run dev:nodemon
   ```

## Need Help?

- Check the main [README.md](README.md) for detailed documentation
- View the [Corbado tutorial](https://www.corbado.com/blog/circle-calculator-how-to-implement-passkeys) for more context
- Open Chrome DevTools to see WebAuthn logs

## Common Issues

**"User already exists" error?**
- Either login with the existing user
- Or use a different username

**WebAuthn modal not appearing?**
- Make sure you're on localhost or HTTPS
- Check browser compatibility (Chrome, Firefox, Safari, Edge)
- Try Chrome's virtual authenticator (DevTools → Application → WebAuthn)

**Database connection failed?**
- Make sure Docker is running: `docker compose ps`
- Restart the containers: `docker compose restart`
