# NetworkNexus User Guide

## Overview
NetworkNexus is a secure remote desktop application that allows you to:
- Control your work PC remotely
- Transfer files securely
- Execute commands
- Record and replay sessions
- Monitor performance
- Maintain secure connections

## Security Features

### Two-Factor Authentication
1. Enable 2FA in Security Settings
2. Scan QR code with authenticator app
3. Enter both password and 2FA code when connecting

### SSL/TLS Encryption
- All communications are encrypted
- Self-signed certificates auto-generate
- Certificates auto-renew monthly

### Session Management
- 30-minute default timeout
- Connection history tracking
- Secure session termination
- Activity logging

## Core Features

### Remote Desktop
1. Connect using work PC's IP address
2. Adjust screen quality settings:
   - Quality (Low/Medium/High)
   - Frame Rate (1-60 FPS)
   - Compression (10-100%)
   - Scale (25-100%)

### File Operations
- Browse remote files
- Upload/Download with progress tracking
- Create/Delete folders
- Chunked file transfers for large files

### Performance Monitoring
- Real-time FPS tracking
- Bandwidth usage
- Latency monitoring
- Auto-quality adjustment
- Performance stats overlay

### Session Recording
1. Start recording from RecordingPlayer
2. All actions are recorded:
   - Mouse movements
   - Keyboard input
   - Commands executed
3. Playback recorded sessions
4. Manage recordings

### Command Console
- Execute remote commands
- View command output
- Command history

### Clipboard Sync
- Automatic clipboard synchronization
- Toggle sync on/off
- Supports text content

## Settings

### Screen Settings
- Quality presets
- Custom FPS limits
- Resolution scaling
- Compression levels

### Performance Settings
- Auto-adjust quality
- Bandwidth limits
- Performance monitoring
- Stats display

### Security Settings
- 2FA management
- Session timeout configuration
- Connection history
- SSL certificate management

## Troubleshooting

### Common Issues
1. Connection Failed
   - Verify IP address
   - Check firewall settings
   - Ensure server is running

2. Performance Issues
   - Lower quality settings
   - Reduce frame rate
   - Enable auto-quality adjustment

3. Authentication Problems
   - Verify password
   - Check 2FA code
   - Ensure time sync for 2FA

### Security Best Practices
- Change default password
- Enable 2FA
- Use on trusted networks
- Regular security audits
- Monitor connection history

## Technical Reference

### Server Configuration
```env
SERVER_PASSWORD=your-secure-password
TOTP_SECRET=your-2fa-secret
PORT=3000
SSL_ENABLED=true
```

### Client Settings
- Save in localStorage
- Persistent across sessions
- Encrypted sensitive data

### File Paths
- Logs: /server/logs/
- SSL Certs: /server/config/ssl/
- Recordings: Local storage
