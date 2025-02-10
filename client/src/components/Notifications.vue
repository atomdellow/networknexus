<template>
  <div class="notifications">
    <div v-for="msg in messages" 
         :key="msg.id" 
         :class="['notification', msg.type]">
      {{ msg.message }}
    </div>
  </div>
</template>

<script setup>
import { useNotificationStore } from '../stores/notification';
import { storeToRefs } from 'pinia';

const { messages } = storeToRefs(useNotificationStore());
</script>

<style scoped>
.notifications {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
}

.notification {
  padding: 12px 20px;
  margin-bottom: 10px;
  border-radius: 4px;
  color: white;
  min-width: 200px;
}

.error {
  background-color: #ff4444;
}

.success {
  background-color: #00C851;
}

.info {
  background-color: #33b5e5;
}
</style>
