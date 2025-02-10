# NetworkNexus Documentation

## Overview
NetworkNexus is a remote desktop application that allows you to:
- View and control a remote computer's screen
- Execute terminal commands
- Manage files remotely
- Transfer files between computers

## Installation

### Prerequisites
- Node.js 14+ installed on both computers
- Vue.js 3 for the client application
- Required npm packages:
  ```bash
  npm install socket.io-client robotjs screenshot-desktop express
  ```

### Setup

1. Start the server:
```bash
cd server
npm install
node index.js
```

2. Start the client:
```bash
cd client
npm install
npm run dev
```

## Features

### Remote Desktop
1. Navigate to the "Remote Desktop" tab
2. Click "Connect" to start screen sharing
3. Use your mouse and keyboard to control the remote PC
4. Enter commands in the console below the screen

Supported actions:
- Mouse movement and clicks
- Keyboard input
- Command execution
- Screen viewing

### File Management
1. Navigate to the "Files" tab
2. Browse remote files and folders
3. Upload files using the upload button
4. Create new folders
5. Delete files and folders

### Keyboard Shortcuts
- `Ctrl + Alt + D`: Disconnect
- `Ctrl + Alt + R`: Refresh screen
- `Esc`: Stop screen sharing

## Troubleshooting

### Common Issues

1. Connection Failed
   - Verify server is running
   - Check firewall settings
   - Confirm correct IP/port

2. Black Screen
   - Restart screen sharing
   - Check screen capture permissions

3. File Transfer Failed
   - Check write permissions
   - Verify available disk space

## Security Considerations

- Use over trusted networks only
- Enable firewall rules appropriately
- Keep both client and server updated
- Use strong authentication when implemented

## Development

### Project Structure
```
NetworkNexus/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── stores/
│   │   ├── views/
│   │   └── App.vue
│   └── package.json
├── server/
│   ├── index.js
│   └── package.json
└── docs/
    └── README.md
```
