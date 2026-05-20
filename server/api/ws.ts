export const presenceStore = new Map<string, number>();
const connectedPeers = new Set<any>();

const HEARTBEAT_TIMEOUT_MS = 10000; 
const usersDb = ["1", "2", "3", "4", "5"]; 

function broadcastPresence() {
  const now = Date.now();
  
  const activeUsers = usersDb.map(id => {
    const lastHeartbeat = presenceStore.get(id) || null;
    const isOnline = lastHeartbeat !== null && (now - lastHeartbeat <= HEARTBEAT_TIMEOUT_MS);
    return {
      id,
      isOnline,
      lastSeen: lastHeartbeat || (now - 600000)
    };
  });

  const payload = JSON.stringify({ type: 'presence_update', data: activeUsers });
  
  for (const peer of connectedPeers) {
    try {
      peer.send(payload);
    } catch {
      connectedPeers.delete(peer);
    }
  }
}

setInterval(() => {
  let stateChanged = false;
  const now = Date.now();

  presenceStore.forEach((lastHeartbeat, userId) => {
    if (now - lastHeartbeat > HEARTBEAT_TIMEOUT_MS) {
      presenceStore.delete(userId);
      stateChanged = true;
    }
  });

  if (stateChanged) {
    broadcastPresence();
  }
}, 3000);

export default defineWebSocketHandler({
  open(peer) {
    connectedPeers.add(peer);
  },

  message(peer, message) {
    try {
      const msg = JSON.parse(message.text());
      
      if (msg.type === 'heartbeat' && msg.userId) {
        presenceStore.set(msg.userId.toString(), Date.now());
        
        (peer as any).ctx = { userId: msg.userId.toString() };
        
        broadcastPresence();
      }
    } catch (e) {
      console.error('Invalid socket message structure received');
    }
  },

  close(peer) {
    connectedPeers.delete(peer);
  }
});