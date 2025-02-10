import { defineStore } from 'pinia';

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    screenQuality: localStorage.getItem('screenQuality') || 'medium', // low, medium, high
    frameRate: parseInt(localStorage.getItem('frameRate')) || 30,
    compression: parseInt(localStorage.getItem('compression')) || 70,
    scaleRatio: parseFloat(localStorage.getItem('scaleRatio')) || 1.0,
    showStats: localStorage.getItem('showStats') === 'true'
  }),

  actions: {
    updateScreenQuality(quality) {
      this.screenQuality = quality;
      localStorage.setItem('screenQuality', quality);
    },

    updateFrameRate(rate) {
      this.frameRate = rate;
      localStorage.setItem('frameRate', rate);
    },

    updateCompression(level) {
      this.compression = level;
      localStorage.setItem('compression', level);
    },

    updateScaleRatio(ratio) {
      this.scaleRatio = ratio;
      localStorage.setItem('scaleRatio', ratio);
    },

    toggleStats() {
      this.showStats = !this.showStats;
      localStorage.setItem('showStats', this.showStats);
    }
  }
});
