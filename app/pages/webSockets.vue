<!-- pages/index.vue -->
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';

const currentUserId = ref('4');

interface UserPresence {
  id: string;
  isOnline: boolean;
  lastSeen: number;
}

const presenceRawData = ref<UserPresence[]>([]);
const connectionStatus = ref('Disconnected');

let ws: WebSocket | null = null;
let heartbeatInterval: ReturnType<typeof setInterval> | null = null;

const connectWebSocket = () => {
  if (ws) {
    ws.close();
    clearInterval(heartbeatInterval!);
  }

  const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
  ws = new WebSocket(`${protocol}${window.location.host}/api/ws`);
  connectionStatus.value = 'Connecting...';

  ws.onopen = () => {
    connectionStatus.value = 'Connected';
    
    // Send immediate heartbeat on connection to declare identity
    sendHeartbeatEvent();

    // Ingress Stream: Schedule heartbeats every 4 seconds
    heartbeatInterval = setInterval(sendHeartbeatEvent, 4000);
  };

  ws.onmessage = (event) => {
    const payload = JSON.parse(event.data);
    if (payload.type === 'presence_update') {
      // Egress Capture: Update reactive state array directly from the push stream
      presenceRawData.value = payload.data;
    }
  };

  ws.onclose = () => {
    connectionStatus.value = 'Disconnected';
    if (heartbeatInterval) clearInterval(heartbeatInterval);
  };
};

const sendHeartbeatEvent = () => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'heartbeat', userId: currentUserId.value }));
  }
};

// Sort online users to the top
const sortedDashboardUsers = computed(() => {
  return [...presenceRawData.value]
    .filter(user => user.id !== currentUserId.value)
    .sort((a, b) => {
      if (a.isOnline === b.isOnline) return b.lastSeen - a.lastSeen;
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

// Re-authenticate immediately if user toggles select menu
watch(currentUserId, () => {
  sendHeartbeatEvent();
});

onMounted(() => {
  connectWebSocket();
});

onUnmounted(() => {
  if (ws) ws.close();
  if (heartbeatInterval) clearInterval(heartbeatInterval);
});
</script>

<template>
  <div class="presence-container">
    <header class="dashboard-header">
      <h1>🔌 WebSocket Presence</h1>
      <div class="network-badge" :class="connectionStatus.toLowerCase()">
        {{ connectionStatus }}
      </div>
    </header>

    <section class="session-bar">
      <label for="identity-select">View As: </label>
      <select id="identity-select" v-model="currentUserId" class="context-select">
        <option value="1">User 1</option>
        <option value="2">User 2</option>
        <option value="3">User 3</option>
        <option value="4">User 4</option>
        <option value="5">User 5</option>
      </select>
    </section>

    <main class="user-list-wrapper">
      <div 
        v-for="user in sortedDashboardUsers" 
        :key="user.id" 
        class="user-card"
        :class="{ 'is-online': user.isOnline }"
      >
        <div class="user-meta">
          <span class="status-indicator"></span>
          <span class="user-name">User Account #{{ user.id }}</span>
        </div>
        
        <div class="status-label">
          <span v-if="user.isOnline" class="online-text">Online</span>
          <span v-else class="offline-text">{{ formatRelativeTime(user.lastSeen) }}</span>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.presence-container {
  max-width: 500px;
  margin: 2rem auto;
  font-family: system-ui, sans-serif;
  background: #111827;
  color: #fff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 10px 25px rgba(0,0,0,0.4);
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #1f2937;
  padding-bottom: 1rem;
}

h1 { font-size: 1.25rem; margin: 0; }

.network-badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-weight: bold;
  background: #374151;
}
.network-badge.connected { background: #065f46; color: #34d399; }
.network-badge.connecting { background: #92400e; color: #fbbf24; }
.network-badge.disconnected { background: #991b1b; color: #f87171; }

.session-bar {
  margin: 1rem 0 1.5rem;
  background: #1f2937;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
}

.context-select {
  background: #111827;
  color: #fff;
  border: 1px solid #374151;
  border-radius: 4px;
  padding: 0.2rem 0.5rem;
  margin-left: 0.5rem;
  outline: none;
}

.user-list-wrapper { display: flex; flex-direction: column; gap: 0.75rem; }

.user-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #1f2937;
  padding: 1rem;
  border-radius: 8px;
}

.user-meta { display: flex; align-items: center; gap: 0.75rem; }
.status-indicator { width: 10px; height: 10px; border-radius: 50%; background: #4b5563; }
.is-online .status-indicator { background: #10b981; box-shadow: 0 0 8px #10b981; }

.online-text { color: #10b981; font-weight: bold; }
.offline-text { color: #9ca3af; font-size: 0.85rem; }
</style>