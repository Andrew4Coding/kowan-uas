# Passkeys Tutorial - Express + TypeScript + WebAuthn

A complete implementation of passkey authentication using Express, TypeScript, and WebAuthn based on the Corbado reference implementation.

## Features

- 🔐 WebAuthn passkey authentication (registration & login)
- 🚀 Express.js backend with TypeScript
- 🗄️ MySQL database for user and credential storage
- 🐳 Docker support for easy deployment
- 🎨 Simple, clean frontend with vanilla JavaScript
- 📦 SimpleWebAuthn library integration

## Project Structure

```
passkeys-tutorial/
├── src/
│   ├── controllers/          # Business logic for passkey operations
│   │   ├── authentication.ts # Passkey login logic
│   │   └── registration.ts   # Passkey registration logic
│   ├── middleware/
│   │   ├── customError.ts    # Custom error handling
│   │   └── errorHandler.ts   # Error handler middleware
│   ├── public/               # Frontend files
│   │   ├── index.html        # Main HTML page
│   │   ├── css/
│   │   │   └── style.css     # Styling
│   │   └── js/
│   │       └── script.js     # Frontend WebAuthn logic
│   ├── routes/
│   │   └── routes.ts         # API route definitions
│   ├── services/
│   │   ├── credentialService.ts # Credential database operations
│   │   └── userService.ts       # User database operations
│   ├── utils/
│   │   ├── constants.ts      # Constants (rpID, origin, etc.)
│   │   └── utils.ts          # Helper functions
│   ├── database.ts           # MySQL connection
│   ├── index.ts              # Application entry point
│   └── server.ts             # Express server configuration
├── config.json               # App configuration
├── docker-compose.yml        # Docker services definition
├── Dockerfile                # Docker image definition
├── init-db.sql               # Database schema
├── package.json              # Dependencies
└── tsconfig.json             # TypeScript configuration
```

## Prerequisites

- Node.js (v14 or higher)
- Docker and Docker Compose (optional, for containerized deployment)
- A modern browser that supports WebAuthn (Chrome, Firefox, Safari, Edge)

## Installation

### Option 1: Local Development (without Docker)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up MySQL database manually:**
   - Install MySQL locally
   - Create a database named `webauthn_db`
   - Run the SQL commands from `init-db.sql`

3. **Set environment variables:**
   ```bash
   export DB_HOST=localhost
   export DB_USER=root
   export DB_PASSWORD=my-secret-pw
   export DB_NAME=webauthn_db
   export SESSION_SECRET=secret123
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Access the application:**
   Open your browser and navigate to: `http://localhost:8080`

### Option 2: Docker Deployment (Recommended)

1. **Start all services with Docker Compose:**
   ```bash
   docker compose up
   ```

   This will:
   - Start a MySQL database container
   - Start the Express application container
   - Initialize the database with the required schema
   - Expose the application on port 8080

2. **Access the application:**
   Open your browser and navigate to: `http://localhost:8080`

## Usage

### Registering a New User with Passkey

1. Enter a username in the input field
2. Click the "Register" button
3. Your browser will prompt you to create a passkey (Face ID, Touch ID, Windows Hello, etc.)
4. Complete the biometric verification
5. Your passkey is now registered!

### Logging In with Passkey

1. Enter your username in the input field
2. Click the "Login" button
3. Your browser will prompt you to authenticate with your passkey
4. Complete the biometric verification
5. You're logged in!

## API Endpoints

### Registration Endpoints

- **POST** `/api/passkey/registerStart`
  - Body: `{ "username": "string" }`
  - Returns: PublicKeyCredentialCreationOptions

- **POST** `/api/passkey/registerFinish`
  - Body: RegistrationResponseJSON (from WebAuthn)
  - Returns: `{ "verified": true }`

### Authentication Endpoints

- **POST** `/api/passkey/loginStart`
  - Body: `{ "username": "string" }`
  - Returns: PublicKeyCredentialRequestOptions

- **POST** `/api/passkey/loginFinish`
  - Body: AuthenticationResponseJSON (from WebAuthn)
  - Returns: `{ "verified": true }`

## Database Schema

### Users Table
```sql
CREATE TABLE users(
    id       VARCHAR(255) PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE
);
```

### Credentials Table
```sql
CREATE TABLE credentials(
    id            INT AUTO_INCREMENT PRIMARY KEY,
    user_id       VARCHAR(255) NOT NULL,
    credential_id VARCHAR(255) NOT NULL,
    public_key    TEXT         NOT NULL,
    counter       INT          NOT NULL,
    transports    VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users (id)
);
```

## Development

### Available Scripts

- `npm run dev` - Run development server with ts-node
- `npm run dev:nodemon` - Run with auto-reload on file changes
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run compiled JavaScript

### Testing with Chrome DevTools

1. Open Chrome DevTools (F12)
2. Go to Application → Storage → Web Authentication
3. Click "Enable virtual authenticator environment"
4. Add a virtual authenticator for testing

## Configuration

### Constants (src/utils/constants.ts)

```typescript
export const rpName: string = "Passkeys Tutorial";
export const rpID: string = "localhost";
export const origin: string = `http://${rpID}:8080`;
```

For production, update these to match your domain:
```typescript
export const rpID: string = "yourdomain.com";
export const origin: string = "https://yourdomain.com";
```

## Security Considerations

⚠️ **This is a tutorial/demo application. For production use, you need to:**

- Use HTTPS (required for WebAuthn in production)
- Implement proper session management
- Add route protection and authentication middleware
- Implement proper error handling
- Add rate limiting
- Implement passkey management (add, remove, rename passkeys)
- Add multi-device support
- Implement fallback authentication methods
- Use secure session secrets
- Implement CSRF protection
- Add proper logging and monitoring

## Troubleshooting

### WebAuthn not working

- Make sure you're using a supported browser
- Ensure you're testing on `localhost` or HTTPS
- Check that your device has biometric capabilities
- Try using Chrome's virtual authenticator for testing

### Database connection errors

- Verify MySQL is running: `docker compose ps`
- Check database credentials in environment variables
- Ensure the database is initialized with the schema

### TypeScript compilation errors

- Try updating ts-node: `npm install ts-node@10.8.1`
- Clear build directory: `rm -rf build`
- Reinstall dependencies: `rm -rf node_modules && npm install`

## Resources

- [WebAuthn Specification](https://www.w3.org/TR/webauthn/)
- [SimpleWebAuthn Documentation](https://simplewebauthn.dev/)
- [Passkeys.dev](https://passkeys.dev/)
- [Corbado Passkeys Blog](https://www.corbado.com/blog/circle-calculator-how-to-implement-passkeys)

## License

MIT

## Contributing

This is a tutorial project. Feel free to fork and modify for your needs!

## Acknowledgments

Based on the comprehensive passkey tutorial from [Corbado](https://www.corbado.com/blog/circle-calculator-how-to-implement-passkeys)
