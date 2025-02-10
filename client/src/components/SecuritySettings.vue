<template>
  <div class="security-settings">
    <h3>Security Settings</h3>
    
    <div class="setting-group">
      <h4>Two-Factor Authentication</h4>
      <div v-if="!totpEnabled">
        <button @click="setupTOTP">Enable 2FA</button>
      </div>
      <div v-else class="totp-settings">
        <qrcode-vue :value="totpUrl" :size="200" level="M" />
        <div class="totp-secret">
          Secret: {{ totpSecret }}
        </div>
        <button @click="disableTOTP">Disable 2FA</button>
      </div>
    </div>

    <div class="setting-group">
      <h4>Session Settings</h4>
      <label>
        Session Timeout:
        <select v-model="sessionTimeout">
          <option value="900000">15 minutes</option>
          <option value="1800000">30 minutes</option>
          <option value="3600000">1 hour</option>
        </select>
      </label>
    </div>

    <ConnectionHistory />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuthEnhancedStore } from '../stores/auth-enhanced';
import ConnectionHistory from './ConnectionHistory.vue';
import QrcodeVue from 'qrcode.vue';

const authStore = useAuthEnhancedStore();

const totpEnabled = computed(() => !!authStore.totpSecret);
const totpSecret = ref('');
const totpUrl = ref('');
const sessionTimeout = ref(authStore.sessionTimeout);

async function setupTOTP() {
  const { secret, url } = await authStore.setupTOTP();
  totpSecret.value = secret;
  totpUrl.value = url;
}

function disableTOTP() {
  authStore.disableTOTP();
  totpSecret.value = '';
  totpUrl.value = '';
}

watch(sessionTimeout, (newValue) => {
  authStore.updateSessionTimeout(parseInt(newValue));
});
</script>

<style scoped>
.security-settings {
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.setting-group {
  margin: 20px 0;
}

.totp-settings {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.totp-secret {
  font-family: monospace;
  padding: 10px;
  background: #f5f5f5;
  border-radius: 4px;
}
</style>
