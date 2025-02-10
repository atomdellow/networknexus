import { defineStore } from 'pinia';

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    messages: [],
    timeout: 5000
  }),

  actions: {
    show(message, type = 'info') {
      const id = Date.now();
      this.messages.push({ id, message, type });
      
      setTimeout(() => {
        this.messages = this.messages.filter(m => m.id !== id);
      }, this.timeout);
    },

    error(message) {
      this.show(message, 'error');
    },

    success(message) {
      this.show(message, 'success');
    }
  }
});
