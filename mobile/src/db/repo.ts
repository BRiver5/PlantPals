import type {
  Plant,
  PlantDetail,
  PlantInput,
  Stats,
  WateringLog,
  WeeklyBucket,
} from '@/types/models';
import { getDb } from './database';

const WEEKS = 8;

// ---- date helpers (local time, matching how the UI groups plants) ----

function nowIso(): string {
  return new Date().toISOString();
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function computeNextDue(anchorIso: string, intervalDays: number): string {
  return addDays(new Date(anchorIso), intervalDays).toISOString();
}

function startOfDay(d: Date): Date {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

function monday(d: Date): Date {
  const c = startOfDay(d);
  const day = (c.getDay() + 6) % 7; // 0 = Monday
  return addDays(c, -day);
}

function localDayKey(d: Date): string {
  return startOfDay(d).toISOString();
}

// ---- plant CRUD ----

const PLANT_COLUMNS =
  'id, name, species, photo_url, interval_days, water_amount_ml, location, care_notes, created_at, last_watered_at, next_due_at';

async function fetchPlant(id: number): Promise<Plant | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<Plant>(
    `SELECT ${PLANT_COLUMNS} FROM plants WHERE id = ?`,
    [id],
  );
  return row ?? null;
}

async function fetchLogs(plantId: number): Promise<WateringLog[]> {
  const db = await getDb();
  return db.getAllAsync<WateringLog>(
    `SELECT id, plant_id, watered_at FROM watering_logs WHERE plant_id = ? ORDER BY watered_at DESC`,
    [plantId],
  );
}

async function toDetail(plant: Plant): Promise<PlantDetail> {
  return { ...plant, logs: await fetchLogs(plant.id) };
}

export const repo = {
  async listPlants(): Promise<Plant[]> {
    const db = await getDb();
    return db.getAllAsync<Plant>(
      `SELECT ${PLANT_COLUMNS} FROM plants ORDER BY next_due_at ASC, name ASC`,
    );
  },

  async getPlant(id: number): Promise<PlantDetail> {
    const plant = await fetchPlant(id);
    if (!plant) throw new Error('Plant not found.');
    return toDetail(plant);
  },

  async createPlant(input: PlantInput): Promise<PlantDetail> {
    const db = await getDb();
    const created = nowIso();
    const anchor = input.last_watered_at ?? created;
    const nextDue = computeNextDue(anchor, input.interval_days);
    const result = await db.runAsync(
      `INSERT INTO plants
        (name, species, photo_url, interval_days, water_amount_ml, location, care_notes, created_at, last_watered_at, next_due_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        input.name.trim(),
        input.species ?? null,
        input.photo_url ?? null,
        input.interval_days,
        input.water_amount_ml ?? null,
        input.location ?? null,
        input.care_notes ?? null,
        created,
        input.last_watered_at ?? null,
        nextDue,
      ],
    );
    return this.getPlant(result.lastInsertRowId);
  },

  async updatePlant(id: number, patch: Partial<PlantInput>): Promise<PlantDetail> {
    const existing = await fetchPlant(id);
    if (!existing) throw new Error('Plant not found.');

    const merged: Plant = {
      ...existing,
      name: patch.name !== undefined ? patch.name.trim() : existing.name,
      species: patch.species !== undefined ? patch.species : existing.species,
      photo_url: patch.photo_url !== undefined ? patch.photo_url : existing.photo_url,
      interval_days: patch.interval_days ?? existing.interval_days,
      water_amount_ml:
        patch.water_amount_ml !== undefined ? patch.water_amount_ml : existing.water_amount_ml,
      location: patch.location !== undefined ? patch.location : existing.location,
      care_notes: patch.care_notes !== undefined ? patch.care_notes : existing.care_notes,
    };

    // If the interval changed, recompute the next due date from the current anchor.
    if (patch.interval_days !== undefined) {
      const anchor = merged.last_watered_at ?? merged.created_at;
      merged.next_due_at = computeNextDue(anchor, merged.interval_days);
    }

    const db = await getDb();
    await db.runAsync(
      `UPDATE plants SET
        name = ?, species = ?, photo_url = ?, interval_days = ?, water_amount_ml = ?,
        location = ?, care_notes = ?, next_due_at = ?
       WHERE id = ?`,
      [
        merged.name,
        merged.species,
        merged.photo_url,
        merged.interval_days,
        merged.water_amount_ml,
        merged.location,
        merged.care_notes,
        merged.next_due_at,
        id,
      ],
    );
    return this.getPlant(id);
  },

  async deletePlant(id: number): Promise<void> {
    const db = await getDb();
    // watering_logs cascade via the foreign key.
    await db.runAsync(`DELETE FROM plants WHERE id = ?`, [id]);
  },

  async waterPlant(id: number, wateredAt?: string): Promise<PlantDetail> {
    const plant = await fetchPlant(id);
    if (!plant) throw new Error('Plant not found.');
    const when = wateredAt ?? nowIso();
    const db = await getDb();
    await db.runAsync(`INSERT INTO watering_logs (plant_id, watered_at) VALUES (?, ?)`, [id, when]);
    await db.runAsync(`UPDATE plants SET last_watered_at = ?, next_due_at = ? WHERE id = ?`, [
      when,
      computeNextDue(when, plant.interval_days),
      id,
    ]);
    return this.getPlant(id);
  },

  async plantHistory(id: number): Promise<WateringLog[]> {
    return fetchLogs(id);
  },

  async deleteWatering(plantId: number, logId: number): Promise<void> {
    const plant = await fetchPlant(plantId);
    if (!plant) throw new Error('Plant not found.');
    const db = await getDb();
    await db.runAsync(`DELETE FROM watering_logs WHERE id = ? AND plant_id = ?`, [logId, plantId]);

    // Re-anchor the schedule to the most recent remaining log (or creation time).
    const latest = await db.getFirstAsync<{ watered_at: string }>(
      `SELECT watered_at FROM watering_logs WHERE plant_id = ? ORDER BY watered_at DESC LIMIT 1`,
      [plantId],
    );
    const lastWatered = latest?.watered_at ?? null;
    const anchor = lastWatered ?? plant.created_at;
    await db.runAsync(`UPDATE plants SET last_watered_at = ?, next_due_at = ? WHERE id = ?`, [
      lastWatered,
      computeNextDue(anchor, plant.interval_days),
      plantId,
    ]);
  },

  async stats(): Promise<Stats> {
    const db = await getDb();
    const now = new Date();
    const today = startOfDay(now);

    const totalPlants =
      (await db.getFirstAsync<{ n: number }>(`SELECT COUNT(*) AS n FROM plants`))?.n ?? 0;
    const wateringsTotal =
      (await db.getFirstAsync<{ n: number }>(`SELECT COUNT(*) AS n FROM watering_logs`))?.n ?? 0;

    const dueRows = await db.getAllAsync<{ next_due_at: string }>(
      `SELECT next_due_at FROM plants`,
    );
    let dueToday = 0;
    let overdue = 0;
    for (const r of dueRows) {
      const day = startOfDay(new Date(r.next_due_at)).getTime();
      if (day < today.getTime()) overdue++;
      else if (day === today.getTime()) dueToday++;
    }

    const logRows = await db.getAllAsync<{ watered_at: string }>(
      `SELECT watered_at FROM watering_logs`,
    );
    const times = logRows.map((r) => new Date(r.watered_at));

    // Waterings this (local) month.
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const wateringsThisMonth = times.filter((t) => t.getTime() >= monthStart).length;

    // Streaks over the set of distinct watered days.
    const dayKeys = new Set(times.map((t) => localDayKey(t)));
    const currentStreak = computeCurrentStreak(dayKeys, today);
    const bestStreak = computeBestStreak(dayKeys);

    // Weekly buckets for the trailing WEEKS weeks (Monday-anchored).
    const thisMonday = monday(today);
    const firstMonday = addDays(thisMonday, -(WEEKS - 1) * 7);
    const counts = new Map<number, number>();
    for (const t of times) {
      const wk = monday(t).getTime();
      if (wk >= firstMonday.getTime()) counts.set(wk, (counts.get(wk) ?? 0) + 1);
    }
    const weekly: WeeklyBucket[] = [];
    for (let i = 0; i < WEEKS; i++) {
      const wk = addDays(firstMonday, i * 7);
      weekly.push({
        week_start: wk.toISOString(),
        label: wk.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        count: counts.get(wk.getTime()) ?? 0,
      });
    }

    return {
      total_plants: totalPlants,
      waterings_this_month: wateringsThisMonth,
      waterings_total: wateringsTotal,
      due_today: dueToday,
      overdue,
      current_streak: currentStreak,
      best_streak: bestStreak,
      weekly,
    };
  },
};

function computeCurrentStreak(dayKeys: Set<string>, today: Date): number {
  if (dayKeys.size === 0) return 0;
  let cursor = dayKeys.has(localDayKey(today)) ? today : addDays(today, -1);
  if (!dayKeys.has(localDayKey(cursor))) return 0;
  let streak = 0;
  while (dayKeys.has(localDayKey(cursor))) {
    streak++;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

function computeBestStreak(dayKeys: Set<string>): number {
  if (dayKeys.size === 0) return 0;
  const days = [...dayKeys].map((k) => new Date(k).getTime()).sort((a, b) => a - b);
  let best = 1;
  let current = 1;
  for (let i = 1; i < days.length; i++) {
    if (days[i] - days[i - 1] === 86_400_000) {
      current++;
    } else {
      current = 1;
    }
    best = Math.max(best, current);
  }
  return best;
}
