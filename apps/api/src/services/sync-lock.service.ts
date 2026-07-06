const activeSyncs = new Set<string>();

export const syncLockService = {
  acquire(projectId: string) {
    if (activeSyncs.has(projectId)) {
      return false;
    }

    activeSyncs.add(projectId);
    return true;
  },

  release(projectId: string) {
    activeSyncs.delete(projectId);
  },

  isLocked(projectId: string) {
    return activeSyncs.has(projectId);
  },
};