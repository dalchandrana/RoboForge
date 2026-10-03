-- RoboForge Initial SQLite Schema (PRD §8)
-- WAL mode enabled by runtime connection

CREATE TABLE IF NOT EXISTS profile (
  id TEXT PRIMARY KEY,
  nickname TEXT,
  locale TEXT NOT NULL DEFAULT 'en',
  goal TEXT,
  hardware_owned_json TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value_json TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS lesson_progress (
  lesson_id TEXT PRIMARY KEY,
  status TEXT CHECK(status IN ('none', 'viewed', 'completed')) NOT NULL DEFAULT 'none',
  last_position REAL DEFAULT 0,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS exercise_attempts (
  id TEXT PRIMARY KEY,
  exercise_id TEXT NOT NULL,
  answer_json TEXT NOT NULL,
  passed INTEGER NOT NULL,
  hints_used INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS quiz_attempts (
  id TEXT PRIMARY KEY,
  quiz_id TEXT NOT NULL,
  score REAL NOT NULL,
  answers_json TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS review_cards (
  card_id TEXT PRIMARY KEY,
  lesson_id TEXT NOT NULL,
  ease REAL NOT NULL DEFAULT 2.5,
  due_at TEXT NOT NULL,
  reps INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY,
  lesson_id TEXT NOT NULL,
  body_md TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS bookmarks (
  id TEXT PRIMARY KEY,
  lesson_id TEXT NOT NULL,
  anchor TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS circuits (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  schema_version INTEGER NOT NULL DEFAULT 1,
  json TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sketches (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  code TEXT NOT NULL,
  board TEXT NOT NULL DEFAULT 'uno',
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS project_logs (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  note TEXT,
  photo_path TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS streaks (
  date TEXT PRIMARY KEY,
  activity_count INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS badges (
  badge_id TEXT PRIMARY KEY,
  earned_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS coach_sessions (
  id TEXT PRIMARY KEY,
  context_ref TEXT,
  started_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS coach_messages (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  role TEXT CHECK(role IN ('system', 'user', 'assistant')) NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY(session_id) REFERENCES coach_sessions(id) ON DELETE CASCADE
);
