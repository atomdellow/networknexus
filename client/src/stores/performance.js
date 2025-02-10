import { defineStore } from 'pinia';
import { useSettingsStore } from './settings';

export const usePerformanceStore = defineStore('performance', {
  state: () => ({
    metrics: {
      fps: 0,
      bandwidth: 0,
      latency: 0,
      cpuUsage: 0,
      memoryUsage: 0,
      quality: 'auto'
    },
    autoAdjust: true,
    thresholds: {
      lowBandwidth: 500, // KB/s
      highLatency: 200, // ms
      targetFps: 30
    }
  }),

  actions: {
    updateMetrics(newMetrics) {
      this.metrics = { ...this.metrics, ...newMetrics };
      if (this.autoAdjust) {
        this.adjustQuality();
      }
    },

    adjustQuality() {
      const settingsStore = useSettingsStore();
      const { bandwidth, latency, fps } = this.metrics;

      if (bandwidth < this.thresholds.lowBandwidth || latency > this.thresholds.highLatency) {
        // Degrade quality
        if (settingsStore.frameRate > 15) settingsStore.updateFrameRate(15);
        if (settingsStore.compression > 60) settingsStore.updateCompression(60);
        if (settingsStore.scaleRatio > 0.5) settingsStore.updateScaleRatio(0.5);
        settingsStore.updateScreenQuality('low');
        this.metrics.quality = 'low';
      } else if (bandwidth > this.thresholds.lowBandwidth * 3 && latency < this.thresholds.highLatency / 2) {
        // Improve quality
        if (settingsStore.frameRate < 30) settingsStore.updateFrameRate(30);
        if (settingsStore.compression < 80) settingsStore.updateCompression(80);
        if (settingsStore.scaleRatio < 1) settingsStore.updateScaleRatio(1);
        settingsStore.updateScreenQuality('high');
        this.metrics.quality = 'high';
      }
    },

    toggleAutoAdjust() {
      this.autoAdjust = !this.autoAdjust;
    }
  }
});
