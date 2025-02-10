<template>
  <div class="screen-settings">
    <h3>Screen Settings</h3>
    
    <div class="setting-group">
      <label>Quality:</label>
      <select v-model="quality" @change="updateQuality">
        <option value="low">Low (faster)</option>
        <option value="medium">Medium</option>
        <option value="high">High (slower)</option>
      </select>
    </div>

    <div class="setting-group">
      <label>Frame Rate: {{ frameRate }}fps</label>
      <input type="range" v-model="frameRate" min="1" max="60" @change="updateFrameRate">
    </div>

    <div class="setting-group">
      <label>Compression: {{ compression }}%</label>
      <input type="range" v-model="compression" min="10" max="100" @change="updateCompression">
    </div>

    <div class="setting-group">
      <label>Scale: {{ (scaleRatio * 100).toFixed(0) }}%</label>
      <input type="range" v-model="scaleRatio" min="0.25" max="1" step="0.25" @change="updateScale">
    </div>

    <div class="setting-group">
      <label>Show Stats:</label>
      <input type="checkbox" v-model="showStats" @change="toggleStats">
    </div>

    <div v-if="showStats" class="stats">
      <div>Bandwidth: {{ stats.bandwidth }} KB/s</div>
      <div>Latency: {{ stats.latency }}ms</div>
      <div>FPS: {{ stats.fps }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useSettingsStore } from '../stores/settings';
import { useSocketStore } from '../stores/socket';

const settingsStore = useSettingsStore();
const socketStore = useSocketStore();

const quality = ref(settingsStore.screenQuality);
const frameRate = ref(settingsStore.frameRate);
const compression = ref(settingsStore.compression);
const scaleRatio = ref(settingsStore.scaleRatio);
const showStats = ref(settingsStore.showStats);

const stats = computed(() => socketStore.stats);

function updateQuality() {
  settingsStore.updateScreenQuality(quality.value);
  socketStore.updateScreenSettings();
}

function updateFrameRate() {
  settingsStore.updateFrameRate(parseInt(frameRate.value));
  socketStore.updateScreenSettings();
}

function updateCompression() {
  settingsStore.updateCompression(parseInt(compression.value));
  socketStore.updateScreenSettings();
}

function updateScale() {
  settingsStore.updateScaleRatio(parseFloat(scaleRatio.value));
  socketStore.updateScreenSettings();
}

function toggleStats() {
  settingsStore.toggleStats();
}
</script>

<style scoped>
.screen-settings {
  padding: 15px;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-bottom: 15px;
}

.setting-group {
  margin: 10px 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

label {
  min-width: 100px;
}

input[type="range"] {
  flex: 1;
}

.stats {
  margin-top: 15px;
  padding: 10px;
  background: #f5f5f5;
  border-radius: 4px;
  font-family: monospace;
}
</style>
