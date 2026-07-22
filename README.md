# 🌿 PlantPals — Water Reminder & Log

**Keep your green friends happy.**

A simple, reliable plant-watering reminder and log app. Anonymous (no login), runs
**fully offline on the device** — no backend or network required — with local push
reminders, real watering history and stats, and a built-in catalog of 45 common
houseplants. Built for a clean Google Play first submission.

- **Framework:** Expo SDK 54, React Native 0.81, TypeScript
- **On-device storage:** `expo-sqlite` (plants + watering logs), the app's document
  directory (photos), AsyncStorage (settings/onboarding), and a bundled species catalog
- **Animations:** Reanimated 4 — timing-based motion only (no springy/bouncy motion)
- **Reminders:** `expo-notifications` local notifications per plant

> **No backend needed.** All data lives on the phone. The `backend/` folder is an
> **optional** reference FastAPI service and is *not* required to build or run the app.

---

## Repository layout

```
PlantPals/
└─ mobile/                       Expo app (this is the product)
   └─ src/
      ├─ db/
      │  ├─ database.ts          opens SQLite, creates schema, reset
      │  └─ repo.ts              all data ops + stats/streaks (local)
      ├─ data/catalog.ts         45 built-in plant species (bundled, offline)
      ├─ lib/
      │  ├─ api.ts               local data facade (repo + photo)
      │  ├─ localPhoto.ts        saves photos into the document directory
      │  ├─ notifications.ts     schedule/cancel local reminders
      │  ├─ storage.ts           settings + onboarding (AsyncStorage)
      │  ├─ photo.ts             camera/library pickers
      │  └─ date.ts              due-date grouping + formatting
      ├─ state/                  App / Settings / Plants React contexts
      ├─ components/             PlantCard, WaterButton, BarChart, Field, …
      ├─ navigation/             bottom tabs + native stack
      └─ screens/                Onboarding, MyPlants, AddEdit, Detail, Stats, Settings

└─ backend/                      OPTIONAL reference FastAPI service (unused by the app)
```

---

## Run the app

```bash
cd mobile
npm install
npx expo start
```

Then open it in **Expo Go (SDK 54)** or a development build. That's it — there is no
server to start and nothing to configure.

> `expo-sqlite` is a native module. It is included in the SDK 54 Expo Go, but if you are
> on an older Expo Go you must update it (Play Store) or use a development build:
> `eas build -p android --profile development` (or `npx expo run:android`).

## Build a signed AAB for Google Play

```bash
cd mobile
npm install -g eas-cli
eas login
eas build --platform android --profile production   # produces a signed .aab
eas submit --platform android                        # optional: upload to Play
```

> On **Windows**, `npx expo export` may fail at the local Hermes bytecode step
> (`hermesc.exe` … "private properties are not supported"). That is a quirk of the
> bundled Windows Hermes binary — the JS bundle itself builds cleanly, and EAS/Gradle
> release builds use a working Hermes compiler.

---

## Screens & features

| Screen | What it does |
| --- | --- |
| **Onboarding** | Welcome + a clear notification-permission explanation screen (Play policy). Optional — skippable. |
| **My Plants** | Plants grouped into *Overdue / Water Today / upcoming days*. Tap the droplet to log a watering — it fills, pulses, and the card animates to its new group. Empty state prompts adding the first plant. |
| **Add / Edit Plant** | Photo (camera or library, stored on-device), name, pick from 45 built-in species (prefills interval/amount/care), interval with quick chips, water amount, location, care notes. |
| **Plant Detail** | Large photo, facts, "Water now", care notes, a 30-day watering chart, full history (deletable), edit/delete. |
| **Stats** | Current & best streak, plant/watering counts, "due now", and an 8-week bar chart. All computed locally from real logged events. |
| **Settings** | Notification toggle (requests permission gracefully), reminder time, app version, and "Reset all data". |

**Motion:** every animation uses timing curves — tab cross-fades, card add/remove &
reordering, the water-button fill/pulse, chart bar growth, field focus. No springs, no
overshoot, no bounce.

**Notifications:** on create/edit/water, the plant's reminder is (re)scheduled for its
next due date at the user's chosen reminder time; watering cancels the old one and
schedules the next. Changing the reminder time or toggle reschedules everything.

---

## Google Play — Data Safety disclosures

Because the app is fully on-device, the disclosures are minimal:

- **No data collected or shared.** Plants, watering logs, photos, and preferences are
  stored **only on the device** (SQLite + local files + AsyncStorage) and are never
  transmitted off it. There is no account, server, analytics, or ad SDK.
- **Permissions requested:** `POST_NOTIFICATIONS` (reminders), Camera & Photos (optional
  plant pictures). All optional to core use and requested with in-context explanations.
- Users can erase everything via **Settings → Reset all data**.

---

## Optional: the reference backend

The `backend/` folder contains a self-contained FastAPI + SQLite implementation of the
same data model (useful if you later want cross-device sync). It is **not used** by the
mobile app in its current fully-local form. To run it:

```bash
cd backend
py -m venv .venv
./.venv/Scripts/python.exe -m pip install -r requirements.txt
./.venv/Scripts/python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8071
./.venv/Scripts/python.exe smoke_test.py     # 23 endpoint checks
```
