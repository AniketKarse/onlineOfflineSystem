import { usersDb, presenceStore } from './heartbeat.post';

const HEARTBEAT_TIMEOUT_MS = 20000;

export default defineEventHandler(() => {
  const now = Date.now();

  const presenceList = Object.values(usersDb).map((user) => {
    const lastHeartbeat = presenceStore.get(user.id) || null;
    
    const isOnline = lastHeartbeat !== null && (now - lastHeartbeat <= HEARTBEAT_TIMEOUT_MS);
    // console.log(lastHeartbeat);
    return {
      id: user.id,
      name: user.name,
      isOnline,

      lastSeen: lastHeartbeat || (now - 600000)
    };
  });

  return presenceList;
});