import { defineStore } from 'pinia';
import { useNotificationStore } from './notification';

export const useRecordingStore = defineStore('recording', {
  state: () => ({
    isRecording: false,
    currentRecording: null,
    recordings: [],
    startTime: null,
    events: [],
    maxDuration: 3600000 // 1 hour max recording
  }),

  actions: {
    startRecording() {
      const notificationStore = useNotificationStore();
      if (this.isRecording) return;

      this.isRecording = true;
      this.startTime = Date.now();
      this.events = [];
      this.currentRecording = {
        id: this.startTime,
        name: new Date().toISOString(),
        duration: 0
      };
      
      notificationStore.info('Recording started');
    },

    stopRecording() {
      const notificationStore = useNotificationStore();
      if (!this.isRecording) return;

      this.isRecording = false;
      this.currentRecording.duration = Date.now() - this.startTime;
      this.recordings.push({
        ...this.currentRecording,
        events: [...this.events]
      });
      
      // Save to localStorage
      this.saveRecording(this.currentRecording.id);
      notificationStore.success('Recording saved');
    },

    recordEvent(type, data) {
      if (!this.isRecording) return;
      
      const timestamp = Date.now() - this.startTime;
      this.events.push({ timestamp, type, data });

      // Auto-stop if max duration reached
      if (timestamp >= this.maxDuration) {
        this.stopRecording();
      }
    },

    saveRecording(id) {
      const recording = this.recordings.find(r => r.id === id);
      if (recording) {
        const data = JSON.stringify(recording);
        localStorage.setItem(`recording_${id}`, data);
      }
    },

    loadRecordings() {
      const recordings = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('recording_')) {
          try {
            const data = JSON.parse(localStorage.getItem(key));
            recordings.push(data);
          } catch (error) {
            console.error('Failed to load recording:', error);
          }
        }
      }
      this.recordings = recordings;
    },

    deleteRecording(id) {
      this.recordings = this.recordings.filter(r => r.id !== id);
      localStorage.removeItem(`recording_${id}`);
    }
  }
});
