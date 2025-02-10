# NetworkNexus Setup Guide

## Prerequisites
- Node.js 14+ on both machines
- Network connectivity between PCs
- Administrative access on work PC

## Work PC (Server) Setup

1. Install Dependencies:
```bash
npm install
```

2. Generate SSL Certificate:
```bash
node config/ssl/setup.js
```

3. Configure Environment:
Create .env file:
```env
SERVER_PASSWORD=your-secure-password
TOTP_SECRET=your-2fa-secret
```

4. Start Server:
```bash
npm run start
```

## Local PC (Client) Setup

1. Install Dependencies:
```bash
npm install
```

2. Start Client:
```bash
npm run dev
```

3. Initial Connection:
- Get work PC's IP address
- Enter IP and port (default: 3000)
- Enter server password
- Set up 2FA if enabled

## Security Setup

1. Change Default Password
2. Enable 2FA
3. Configure SSL
4. Set Session Timeout
5. Review Firewall Rules

## Verification Steps

1. Test Connection
2. Verify Screen Sharing
3. Test File Transfer
4. Confirm Command Execution
5. Check Security Features
