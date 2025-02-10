import { defineStore } from 'pinia';
import { useSocketStore } from './socket';
import { useNotificationStore } from './notification';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isAuthenticated: false,
    password: localStorage.getItem('serverPassword') || ''
  }),

  actions: {
    async authenticate(password) {
      const socketStore = useSocketStore();
      const notificationStore = useNotificationStore();

      return new Promise((resolve) => {
        socketStore.socket.emit('authenticate', password);
        socketStore.socket.once('auth-result', (success) => {
          this.isAuthenticated = success;
          if (success) {
            localStorage.setItem('serverPassword', password);
            this.password = password;
            notificationStore.success('Authentication successful');
          } else {
            notificationStore.error('Authentication failed');
          }
          resolve(success);
        });
      });
    },

    logout() {
      this.isAuthenticated = false;
      this.password = '';
      localStorage.removeItem('serverPassword');
      const socketStore = useSocketStore();
      socketStore.disconnect();
    }
  }
});
