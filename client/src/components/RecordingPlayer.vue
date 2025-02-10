<template>
  <div class="recording-player">
    <div class="recording-controls">
      <button @click="toggleRecording" :class="{ active: isRecording }">
        {{ isRecording ? 'Stop Recording' : 'Start Recording' }}
      </button>
      
      <select v-model="selectedRecording" :disabled="isRecording">
        <option value="">Select Recording</option>
        <option v-for="rec in recordings" 
                :key="rec.id" 
                :value="rec.id">
          {{ formatDate(rec.name) }} ({{ formatDuration(rec.duration) }})
        </option>
      </select>

      <div class="playback-controls" v-if="selectedRecording && !isRecording">
        <button @click="playRecording" :disabled="isPlaying">Play</button>
        <button @click="stopPlayback" :disabled="!isPlaying">Stop</button>
        <button @click="deleteRecording" :disabled="isPlaying">Delete</button>
      </div>
    </div>

    <div v-if="isRecording" class="recording-info">
      Recording: {{ formatDuration(recordingDuration) }}
    </div>

    <div v-if="isPlaying" class="playback-info">
      Playing: {{ formatDuration(playbackProgress) }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRecordingStore } from '../stores/recording';
import { useSocketStore } from '../stores/socket';

const recordingStore = useRecordingStore();
const socketStore = useSocketStore();

const selectedRecording = ref('');
const isPlaying = ref(false);
const playbackProgress = ref(0);
const playbackInterval = ref(null);

const isRecording = computed(() => recordingStore.isRecording);
const recordings = computed(() => recordingStore.recordings);
const recordingDuration = computed(() => {
  if (!isRecording.value) return 0;
  return Date.now() - recordingStore.startTime;
});

onMounted(() => {
  recordingStore.loadRecordings();
});

function toggleRecording() {
  if (isRecording.value) {
    recordingStore.stopRecording();
  } else {
    recordingStore.startRecording();
  }
}

function playRecording() {
  const recording = recordings.value.find(r => r.id === selectedRecording.value);
  if (!recording) return;

  isPlaying.value = true;
  playbackProgress.value = 0;
  
  let lastEventIndex = 0;
  
  playbackInterval.value = setInterval(() => {
    playbackProgress.value += 100; // Update every 100ms

    // Play events that should occur at current time
    while (lastEventIndex < recording.events.length) {
      const event = recording.events[lastEventIndex];
      if (event.timestamp <= playbackProgress.value) {
        replayEvent(event);
        lastEventIndex++;
      } else {
        break;
      }
    }

    // Stop when finished
    if (playbackProgress.value >= recording.duration) {
      stopPlayback();
    }
  }, 100);
}

function stopPlayback() {
  if (playbackInterval.value) {
    clearInterval(playbackInterval.value);
    playbackInterval.value = null;
  }
  isPlaying.value = false;
  playbackProgress.value = 0;
}

function replayEvent(event) {
  switch (event.type) {
    case 'mouse-move':
      socketStore.sendMouseMove(event.data.x, event.data.y);
      break;
    case 'mouse-click':
      socketStore.sendMouseClick(event.data.button, event.data.double);
      break;
    case 'key-press':
      socketStore.sendKeyPress(event.data.key, event.data.modifier);
      break;
    // Add other event types as needed
  }
}

function deleteRecording() {
  if (selectedRecording.value) {
    recordingStore.deleteRecording(selectedRecording.value);
    selectedRecording.value = '';
  }
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleString();
}

function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  return `${hours}:${String(minutes % 60).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}
</script>

<style scoped>
.recording-player {
  padding: 15px;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-bottom: 15px;
}

.recording-controls {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.recording-controls select {
  flex: 1;
}

.playback-controls {
  display: flex;
  gap: 5px;
}

button.active {
  background-color: #ff4444;
  color: white;
}

.recording-info, .playback-info {
  font-family: monospace;
  margin-top: 10px;
}
</style>
