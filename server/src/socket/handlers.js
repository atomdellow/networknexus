import { PowerShell } from 'node-powershell';
import { handleFileOperations } from '../services/fileService.js';
import { captureScreen } from '../services/screenCapture.js';

export const setupSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log('Client connected');

    socket.on('file-operation', async (data) => {
      const result = await handleFileOperations(data);
      socket.emit('file-operation-result', result);
    });

    socket.on('request-screen', async () => {
      const screenshot = await captureScreen();
      socket.emit('screen-data', screenshot);
    });

    socket.on('execute-powershell', async (command) => {
      try {
        const ps = new PowerShell({
          executionPolicy: 'Bypass',
          noProfile: true
        });
        
        const result = await ps.invoke(command);
        socket.emit('powershell-result', result);
        await ps.dispose();
      } catch (error) {
        socket.emit('powershell-error', error.message);
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });
};
