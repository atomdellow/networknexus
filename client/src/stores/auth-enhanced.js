import { defineStore } from 'pinia';
import { useSocketStore } from './socket';
import { useNotificationStore } from './notification';
import { totp } from 'otplib';

export const useAuthEnhancedStore = defineStore('auth-enhanced', {
  state: () => ({
    isAuthenticated: false,
    password: localStorage.getItem('serverPassword') || '',
    totpSecret: localStorage.getItem('totpSecret') || '',
    lastActivity: Date.now(),
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
    connectionHistory: JSON.parse(localStorage.getItem('connectionHistory') || '[]')
  }),

  actions: {
    async authenticate(password, totpToken) {
      const socketStore = useSocketStore();
      const notificationStore = useNotificationStore();

      return new Promise((resolve) => {
        socketStore.socket.emit('authenticate', { password, totpToken });
        socketStore.socket.once('auth-result', (success) => {
          this.isAuthenticated = success;
          if (success) {
            localStorage.setItem('serverPassword', password);
            this.password = password;
            this.lastActivity = Date.now();
            this.addConnectionToHistory();
            notificationStore.success('Authentication successful');
          } else {
            notificationStore.error('Authentication failed');
          }
          resolve(success);
        });
      });
    },

    updateLastActivity() {
      this.lastActivity = Date.now();
    },

    checkSessionTimeout() {
      if (Date.now() - this.lastActivity > this.sessionTimeout) {
        this.logout();
        return true;
      }
      return false;
    },

    addConnectionToHistory() {
      const connection = {
        timestamp: Date.now(),
        ip: useSocketStore().serverIP,
        success: true
      };
      this.connectionHistory.unshift(connection);
      if (this.connectionHistory.length > 50) {
        this.connectionHistory.pop();
      }
      localStorage.setItem('connectionHistory', JSON.stringify(this.connectionHistory));
    },

    clearConnectionHistory() {
      this.connectionHistory = [];
      localStorage.removeItem('connectionHistory');
    },

    setupTOTP() {
      const secret = totp.generateSecret();
      this.totpSecret = secret;
      localStorage.setItem('totpSecret', secret);
      return {
        secret,
        url: totp.keyuri('NetworkNexus', 'NetworkNexus', secret)
      };
    },

    verifyTOTP(token) {
      return totp.verify({
        token,
        secret: this.totpSecret
      });
    },

    logout() {
      this.isAuthenticated = false;
      this.lastActivity = 0;
      const socketStore = useSocketStore();
      socketStore.disconnect();
    }
  }
});
