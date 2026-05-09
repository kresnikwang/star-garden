export interface CollectionProgress {
  themeId: string;
  collected: Record<string, number>; // emoji -> count
  totalClicks: number;
  streakDays: number;
  lastVisitDate: string;
  unlockedMelodies: number;
  createdAt: string;
}

const STORAGE_KEY = 'starry-garden-collection';

export function getCollection(themeId: string): CollectionProgress {
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY}-${themeId}`);
    if (stored) {
      const data = JSON.parse(stored) as CollectionProgress;
      // Update streak
      const today = new Date().toISOString().split('T')[0];
      if (data.lastVisitDate !== today) {
        const lastDate = new Date(data.lastVisitDate);
        const todayDate = new Date(today);
        const diffDays = Math.floor(
          (todayDate.getTime() - lastDate.getTime()) / 86400000
        );
        if (diffDays === 1) {
          data.streakDays += 1;
        } else if (diffDays > 1) {
          data.streakDays = 1;
        }
        data.lastVisitDate = today;
        saveCollection(data);
      }
      return data;
    }
  } catch {
    // ignore parse errors
  }

  const newCollection: CollectionProgress = {
    themeId,
    collected: {},
    totalClicks: 0,
    streakDays: 1,
    lastVisitDate: new Date().toISOString().split('T')[0],
    unlockedMelodies: 0,
    createdAt: new Date().toISOString(),
  };
  saveCollection(newCollection);
  return newCollection;
}

export function saveCollection(collection: CollectionProgress): void {
  try {
    localStorage.setItem(
      `${STORAGE_KEY}-${collection.themeId}`,
      JSON.stringify(collection)
    );
  } catch {
    // ignore storage errors
  }
}

export function addCollectible(
  collection: CollectionProgress,
  emoji: string
): CollectionProgress {
  const updated = { ...collection };
  updated.collected = { ...updated.collected };
  updated.collected[emoji] = (updated.collected[emoji] || 0) + 1;
  updated.totalClicks += 1;

  // Unlock melody every 50 clicks
  const newMelodyLevel = Math.floor(updated.totalClicks / 50);
  if (newMelodyLevel > updated.unlockedMelodies) {
    updated.unlockedMelodies = newMelodyLevel;
  }

  saveCollection(updated);
  return updated;
}

export function getSelectedTheme(): string | null {
  try {
    return localStorage.getItem(`${STORAGE_KEY}-selected-theme`);
  } catch {
    return null;
  }
}

export function setSelectedTheme(themeId: string): void {
  try {
    localStorage.setItem(`${STORAGE_KEY}-selected-theme`, themeId);
  } catch {
    // ignore
  }
}