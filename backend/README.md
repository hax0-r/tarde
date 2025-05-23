# Wealthy Way Trade Backend

A Node.js backend application for a cryptocurrency trading platform using Express.js, TypeScript, and MongoDB.

## Features

- User Authentication (Register/Login)
- Email OTP Verification
- Password Reset
- Trading Platform with Graph
- Bot Subscription Plans
- Referral System
- Deposit and Withdrawal
- Bank Account Management
- User Dashboard
- Transaction History
- Settings Management

## Installation

1. Clone the repository

   ```
   git clone https://github.com/yourusername/wealthy-way-trade-backend.git
   cd wealthy-way-trade-backend
   ```

2. Install dependencies

   ```
   npm install
   ```

3. Create a `.env` file in the root directory (use `.env.example` as a template)

4. Set up your MongoDB database (local or Atlas)

5. Build and run the application

   ```
   # Development mode
   npm run dev

   # Production build
   npm run build
   npm start
   ```

## API Documentation

The API endpoints are organized into the following categories:

- Auth: `/api/auth` - Authentication endpoints
- Users: `/api/users` - User profile operations
- Trading: `/api/trading` - Trading operations
- Bot: `/api/bot` - Bot subscription and control
- Banking: `/api/banking` - Bank account management
- Transactions: `/api/transactions` - Transaction history
- Referrals: `/api/referrals` - Referral system

Detailed API documentation coming soon.

## Environment Variables

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/wealthy-way-trade
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRATION=7d
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
EMAIL_FROM=your_email@gmail.com
OTP_EXPIRY=300
```

## License

This project is licensed under the MIT License.
