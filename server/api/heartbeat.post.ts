
export const presenceStore = new Map<string, number>();

export const usersDb = {
  "1": { id: "1", name: "Alice" },
  "2": { id: "2", name: "Bob" },
  "3": { id: "3", name: "Charlie" },
  "4": { id: "4", name: "Diana" },
  "5": { id: "5", name: "Evan" }
};

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { userId } = body;

  if (!userId || !usersDb[userId as keyof typeof usersDb]) {
    throw createError({ statusCode: 400, statusMessage: "Invalid User Session" });
  }
  presenceStore.set(userId.toString(), Date.now());
  // console.log(presenceStore);
  return { success: true };
});