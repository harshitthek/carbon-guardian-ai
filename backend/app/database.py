from __future__ import annotations

import sqlite3
from contextlib import contextmanager
from pathlib import Path
from typing import Iterator

DB_PATH = Path(__file__).resolve().parent.parent / "carbon_guardian.db"


@contextmanager
def get_db() -> Iterator[sqlite3.Connection]:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def init_db() -> None:
    with get_db() as db:
        db.executescript(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                level INTEGER NOT NULL DEFAULT 1,
                persona TEXT NOT NULL DEFAULT 'Eco Warrior',
                green_points INTEGER NOT NULL DEFAULT 0,
                location TEXT NOT NULL DEFAULT 'Delhi'
            );

            CREATE TABLE IF NOT EXISTS user_activity (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                action TEXT NOT NULL,
                transport_mode TEXT,
                electricity_kwh REAL DEFAULT 0,
                waste_kg REAL DEFAULT 0,
                time_of_day INTEGER NOT NULL,
                location_aqi INTEGER NOT NULL,
                weather_temp REAL NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(user_id) REFERENCES users(id)
            );

            CREATE TABLE IF NOT EXISTS emissions_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                transport_kg REAL NOT NULL,
                electricity_kg REAL NOT NULL,
                waste_kg REAL NOT NULL,
                total_kg REAL NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(user_id) REFERENCES users(id)
            );

            CREATE TABLE IF NOT EXISTS recommendations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                prediction TEXT NOT NULL,
                recommendation TEXT NOT NULL,
                impact_percent INTEGER NOT NULL,
                accepted INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(user_id) REFERENCES users(id)
            );

            CREATE TABLE IF NOT EXISTS rewards (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                source TEXT NOT NULL,
                points INTEGER NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(user_id) REFERENCES users(id)
            );

            CREATE TABLE IF NOT EXISTS community_groups (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                weekly_reduction_kg REAL NOT NULL,
                rank INTEGER NOT NULL,
                members INTEGER NOT NULL
            );
            """
        )
        try:
            db.execute("ALTER TABLE users ADD COLUMN password_hash TEXT NOT NULL DEFAULT ''")
        except sqlite3.OperationalError:
            pass


def seed_db() -> None:
    from app.services.auth import get_password_hash

    with get_db() as db:
        user_count = db.execute("SELECT COUNT(*) AS count FROM users").fetchone()["count"]
        if user_count:
            return

        hashed = get_password_hash("password123")
        db.execute(
            """
            INSERT INTO users (name, email, password_hash, level, persona, green_points, location)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            ("Aarav", "aarav@carbonguardian.ai", hashed, 7, "Eco Warrior", 2450, "Delhi"),
        )

        activity_rows = [
            (1, "commute", "cab", 2.4, 0.2, 9, 132, 33),
            (1, "commute", "metro", 2.1, 0.1, 10, 118, 32),
            (1, "food", "walk", 1.6, 0.4, 13, 124, 34),
            (1, "commute", "cab", 3.1, 0.2, 17, 145, 31),
            (1, "errand", "cycling", 1.2, 0.1, 18, 152, 30),
            (1, "commute", "cab", 2.8, 0.2, 17, 138, 31),
            (1, "home_energy", "none", 4.6, 0.3, 20, 126, 29),
            (1, "commute", "metro", 2.0, 0.1, 17, 141, 31),
        ]
        db.executemany(
            """
            INSERT INTO user_activity
            (user_id, action, transport_mode, electricity_kwh, waste_kg, time_of_day, location_aqi, weather_temp)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            activity_rows,
        )

        emissions = [
            (1, 14.1, 3.9, 1.4, 19.4),
            (1, 8.6, 3.2, 1.2, 13.0),
            (1, 12.4, 3.6, 1.2, 17.2),
        ]
        db.executemany(
            """
            INSERT INTO emissions_log (user_id, transport_kg, electricity_kg, waste_kg, total_kg)
            VALUES (?, ?, ?, ?, ?)
            """,
            emissions,
        )

        db.executemany(
            "INSERT INTO rewards (user_id, source, points) VALUES (?, ?, ?)",
            [(1, "Used Metro", 50), (1, "Switched to LED", 30), (1, "Avoided Plastic", 40), (1, "Cycling", 60)],
        )

        db.executemany(
            "INSERT INTO community_groups (name, weekly_reduction_kg, rank, members) VALUES (?, ?, ?, ?)",
            [
                ("Your College Community", 120, 3, 238),
                ("North Campus Climate Club", 94, 5, 119),
                ("Green Delhi Riders", 156, 1, 306),
            ],
        )
