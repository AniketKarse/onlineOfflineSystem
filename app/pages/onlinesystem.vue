<!-- pages/index.vue -->
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';

const currentUserId = ref('4');

interface UserPresence {
  id: string;
  name: string;
  isOnline: boolean;
  lastSeen: number;
}
// important

const presenceRawData = ref<UserPresence[]>([]);
let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
let pollTimer: ReturnType<typeof setInterval> | null = null;

const sendHeartbeat = async () => {
  try {
    await $fetch('/api/heartbeat', {
      method: 'POST',
      body: { userId: currentUserId.value }
    });
  } catch (error) {
    console.error('Heartbeat pipeline failed:', error);
  }
};

const fetchPresenceData = async () => {
  try {
    const data = await $fetch<UserPresence[]>('/api/presence');
    presenceRawData.value = data;
  } catch (error) {
    console.error('Failed to fetch presence matrix:', error);
  }
};

const sortedDashboardUsers = computed(() => {
  return [...presenceRawData.value]
    .filter(user => user.id !== currentUserId.value)
    .sort((a, b) => {
      if (a.isOnline === b.isOnline) {
        return b.lastSeen - a.lastSeen;
      }
      return (b.isOnline ? 1 : 0) - (a.isOnline ? 1 : 0);
    });
});

const formatRelativeTime = (lastSeenEpoch: number) => {
  const diffMs = Date.now() - lastSeenEpoch;
  const mins = Math.floor(diffMs / 60000);
  const secs = Math.floor((diffMs % 60000) / 1000);

  if (mins > 0) return `was online ${mins}m ago`;
  if (secs > 0) return `was online ${secs}s ago`;
  return 'was online just now';
};

watch(currentUserId, () => {
  sendHeartbeat();
  fetchPresenceData();
});

onMounted(() => {
  sendHeartbeat();
  fetchPresenceData();

  // Set up background timers
  heartbeatTimer = setInterval(sendHeartbeat, 4000);   
  pollTimer = setInterval(fetchPresenceData, 2000);  
});

onUnmounted(() => {
  if (heartbeatTimer) clearInterval(heartbeatTimer);
  if (pollTimer) clearInterval(pollTimer);
});
</script>

<template>
  <div class="presence-container">
    <header class="dashboard-header">
      <h1>🟢 Live Presence Matrix</h1>
      
      <div class="session-badge">
        <label for="identity-select">View As: </label>
        <select id="identity-select" v-model="currentUserId" class="context-select">
          <option value="1">Alice (1)</option>
          <option value="2">Bob (2)</option>
          <option value="3">Charlie (3)</option>
          <option value="4">Diana (4)</option>
          <option value="5">Evan (5)</option>
        </select>
      </div>
    </header>

    <main class="user-list-wrapper">
      <div 
        v-for="user in sortedDashboardUsers" 
        :key="user.id" 
        class="user-card"
        :class="{ 'is-online': user.isOnline }"
      >
        <div class="user-meta">
          <span class="status-indicator"></span>
          <span class="user-name">{{ user.name }}</span>
        </div>
        
        <div class="status-label">
          <span v-if="user.isOnline" class="online-text">Online</span>
          <span v-else class="offline-text">{{ formatRelativeTime(user.lastSeen) }}</span>
        </div>
      </div>
    </main>
    <NuxtLink to="/" class="home-link">Home</NuxtLink>
  </div>
</template>

<style scoped>

.home-link {
  display: inline-block;
  margin: 1.5rem auto;
  padding: 0.5rem 1rem;
  background: #04163c;
  color: #fff;
  border-radius: 8px;
  text-decoration: none;
}
.presence-container {
  max-width: 500px;
  margin: 2rem auto;
  font-family: system-ui, sans-serif;
  background: #1e1e24;
  color: #fff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 8px 24px rgba(0,0,0,0.3);
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #333;
  padding-bottom: 1rem;
  margin-bottom: 1.5rem;
}

.dashboard-header h1 {
  font-size: 1.25rem;
  margin: 0;
}

.session-badge {
  font-size: 0.85rem;
  background: #2a2a35;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.session-badge label {
  color: #aaaaaa;
}

.context-select {
  background: #1e1e24;
  color: #fff;
  border: 1px solid #444;
  border-radius: 4px;
  padding: 0.1rem 0.3rem;
  cursor: pointer;
  font-weight: bold;
  outline: none;
}

.user-list-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.user-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #2a2a35;
  padding: 1rem;
  border-radius: 8px;
  transition: transform 0.2s ease, background 0.2s ease;
}

.user-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.status-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #747480;
}

.is-online .status-indicator {
  background: #4caf50; 
  box-shadow: 0 0 8px #4caf50;
}

.user-name {
  font-weight: 500;
}

.status-label {
  font-size: 0.85rem;
}

.online-text {
  color: #4caf50;
  font-weight: bold;
}

.offline-text {
  color: #aaaaaa;
}
</style>