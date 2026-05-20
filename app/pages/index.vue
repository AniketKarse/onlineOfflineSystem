<!-- pages/index.vue -->
<script setup lang="ts">
</script>

<template>
  <div class="presence-container">
    <header class="dashboard-header">
      <h1>🎛️ System Control Panel</h1>
    </header>

    <main class="navigation-wrapper">
      <NuxtLink to="/websockets" class="navigation-card variant-websocket">
        <div class="card-content">
          <div class="icon-avatar">🔌</div>
          <div class="meta-text">
            <h3>WebSocket Presence</h3>
            <p>Persistent, real-time bi-directional pipeline</p>
          </div>
        </div>
        <span class="arrow-indicator">→</span>
      </NuxtLink>
      
      <NuxtLink to="/onlinesystem" class="navigation-card variant-http">
        <div class="card-content">
          <div class="icon-avatar">📡</div>
          <div class="meta-text">
            <h3>HTTP Online System</h3>
            <p>Stateless polling architecture via REST endpoints</p>
          </div>
        </div>
        <span class="arrow-indicator">→</span>
      </NuxtLink>
    </main>
  </div>
</template>

<style scoped>
.presence-container {
  max-width: 550px;
  margin: 4rem auto;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  background: #111827;
  color: #f3f4f6;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
}

.dashboard-header {
  border-bottom: 1px solid #374151;
  padding-bottom: 1.25rem;
  margin-bottom: 2rem;
}

.dashboard-header h1 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.025em;
}

.navigation-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.navigation-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #1f2937;
  border: 1px solid #374151;
  border-radius: 12px;
  padding: 1.25rem;
  text-decoration: none; 
  color: inherit;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-content {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.icon-avatar {
  font-size: 1.5rem;
  background: #111827;
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #374151;
  transition: background 0.2s ease;
}

.meta-text h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  transition: color 0.2s ease;
}

.meta-text p {
  margin: 0;
  font-size: 0.85rem;
  color: #9ca3af;
}

.arrow-indicator {
  font-size: 1.25rem;
  color: #6b7280;
  transform: translateX(0);
  transition: all 0.25s ease;
}

.navigation-card:hover {
  background: #2563eb;
  border-color: #3b82f6;
  box-shadow: 0 4px 20px rgba(37, 99, 235, 0.25);
  transform: translateY(-2px);
}

.navigation-card:hover .icon-avatar {
  background: rgba(255, 255, 255, 0.15);
  border-color: transparent;
}

.navigation-card:hover .meta-text h3 {
  color: #ffffff;
}

.navigation-card:hover .meta-text p {
  color: #bfdbfe;
}

.navigation-card:hover .arrow-indicator {
  color: #ffffff;
  transform: translateX(4px);
}

.navigation-card:active {
  transform: translateY(0);
}
</style>