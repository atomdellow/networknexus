<template>
  <div class="performance-monitor" :class="{ minimized }">
    <div class="header" @click="minimized = !minimized">
      Performance Monitor
      <span class="toggle">{{ minimized ? '+' : '-' }}</span>
    </div>
    <div v-if="!minimized" class="metrics">
      <div class="metric">
        <span>FPS:</span>
        <span :class="getFpsClass">{{ metrics.fps }}</span>
      </div>
      <div class="metric">
        <span>Bandwidth:</span>
        <span :class="getBandwidthClass">{{ formatBandwidth(metrics.bandwidth) }}</span>
      </div>
      <div class="metric">
        <span>Latency:</span>
        <span :class="getLatencyClass">{{ metrics.latency }}ms</span>
      </div>
      <div class="metric">
        <span>Quality:</span>
        <span>{{ metrics.quality }}</span>
      </div>
      <div class="controls">
        <label>
          <input 
            type="checkbox" 
            :checked="autoAdjust" 
            @change="toggleAutoAdjust"
          > Auto-adjust
        </label>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { usePerformanceStore } from '../stores/performance';

const performanceStore = usePerformanceStore();
const minimized = ref(false);

const metrics = computed(() => performanceStore.metrics);
const autoAdjust = computed(() => performanceStore.autoAdjust);

const getFpsClass = computed(() => ({
  'metric-good': metrics.value.fps >= 25,
  'metric-warning': metrics.value.fps >= 15 && metrics.value.fps < 25,
  'metric-bad': metrics.value.fps < 15
}));

const getBandwidthClass = computed(() => ({
  'metric-good': metrics.value.bandwidth >= 1000,
  'metric-warning': metrics.value.bandwidth >= 500 && metrics.value.bandwidth < 1000,
  'metric-bad': metrics.value.bandwidth < 500
}));

const getLatencyClass = computed(() => ({
  'metric-good': metrics.value.latency < 100,
  'metric-warning': metrics.value.latency >= 100 && metrics.value.latency < 200,
  'metric-bad': metrics.value.latency >= 200
}));

function formatBandwidth(bw) {
  return bw >= 1000 ? `${(bw/1000).toFixed(1)}MB/s` : `${bw.toFixed(0)}KB/s`;
}

function toggleAutoAdjust() {
  performanceStore.toggleAutoAdjust();
}
</script>

<style scoped>
.performance-monitor {
  position: fixed;
  bottom: 20px;
  left: 20px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  border-radius: 4px;
  font-family: monospace;
  z-index: 1000;
}

.header {
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
}

.metrics {
  padding: 8px 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.metric {
  display: flex;
  justify-content: space-between;
  margin: 4px 0;
  min-width: 150px;
}

.metric-good { color: #4CAF50; }
.metric-warning { color: #FFC107; }
.metric-bad { color: #f44336; }

.controls {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}
</style>
