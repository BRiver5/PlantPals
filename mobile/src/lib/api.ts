import { repo } from '@/db/repo';
import { savePhoto } from './localPhoto';
import type { PlantInput } from '@/types/models';

/**
 * Local data facade.
 *
 * PlantPals stores everything on-device (SQLite via expo-sqlite, photos in the
 * app's document directory), so the app runs fully offline with no backend.
 * This keeps the previous `api.*` surface used across the screens.
 */
export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export const api = {
  listPlants: () => repo.listPlants(),
  getPlant: (id: number) => repo.getPlant(id),
  createPlant: (input: PlantInput) => repo.createPlant(input),
  updatePlant: (id: number, input: Partial<PlantInput>) => repo.updatePlant(id, input),
  deletePlant: (id: number) => repo.deletePlant(id),
  waterPlant: (id: number, wateredAt?: string) => repo.waterPlant(id, wateredAt),
  plantHistory: (id: number) => repo.plantHistory(id),
  deleteWatering: (plantId: number, logId: number) => repo.deleteWatering(plantId, logId),
  stats: () => repo.stats(),
  /** Persists an image locally and returns its `file://` URI (was a server upload). */
  uploadPhoto: (uri: string) => savePhoto(uri),
};
