#!/usr/bin/env python3
"""
Seed script for music-reviews-portal database.
Truncates artist, album, song, genre tables then inserts fresh data.
Requires: psycopg2  (pip install psycopg2-binary)
"""

import os
import random
import psycopg2

# --- Config ---
# DB = dict(host="localhost", port=5432, dbname="music-reviews-portal-db", user="xxxxx", password="xxxx")
BASE = os.path.dirname(os.path.abspath(__file__))
ALBUM_COVERS_DIR = os.path.join(BASE, "album_covers")
SONG_COVERS_DIR  = os.path.join(BASE, "song_covers")
SONG_MP3S_DIR    = os.path.join(BASE, "song_mp3s")

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def read_bytes(path):
    with open(path, "rb") as f:
        return f.read()

def wiki(title):
    """Build a Wikipedia URL from a title string."""
    return "https://en.wikipedia.org/wiki/" + title.replace(" ", "_")

def parse_filename(fname):
    """
    'Radiohead - Kid A, Cover art.jpeg' -> ('Radiohead', 'Kid A')
    Returns None if pattern doesn't match.
    """
    base = fname.rsplit(", Cover art.", 1)[0]
    if " - " not in base:
        return None
    artist, title = base.split(" - ", 1)
    return artist.strip(), title.strip()


# ---------------------------------------------------------------------------
# Source file lists
# ---------------------------------------------------------------------------

album_cover_files = sorted(os.listdir(ALBUM_COVERS_DIR))
song_cover_files  = sorted(os.listdir(SONG_COVERS_DIR))
mp3_files         = sorted(os.listdir(SONG_MP3S_DIR))

# Parse real artist/title pairs from filenames
real_album_pairs = []  # [(artist_name, album_title, cover_filename)]
for f in album_cover_files:
    parsed = parse_filename(f)
    if parsed:
        real_album_pairs.append((parsed[0], parsed[1], f))

real_song_pairs = []   # [(artist_name, song_title, cover_filename)]
for f in song_cover_files:
    parsed = parse_filename(f)
    if parsed:
        real_song_pairs.append((parsed[0], parsed[1], f))


# ---------------------------------------------------------------------------
# Supplemental made-up names (to reach 100 albums, 100 songs, 50 artists)
# ---------------------------------------------------------------------------

EXTRA_ARTISTS = [
    "The Hollow Echo", "Distant Signal", "Neon Drift", "Pale Architecture",
    "Violet Static", "The Burning Shore", "Crimson Transit", "Soft Machinery",
    "Ember Cascade", "The Quiet Engine", "Glass Meridian", "Lunar Fracture",
    "The Iron Pastoral", "Copper Silence", "Dusk Protocol", "Velvet Collapse",
    "The Fading Atlas", "Magnetic North", "Silver Parallax", "Rust and Marrow",
]

EXTRA_ALBUMS = [
    "Echoes in Reverse", "The Pale Corridor", "Signal Loss", "Drift Patterns",
    "Architecture of Clouds", "Hollow Transit", "The Burning Map", "Soft Machinery",
    "Cascade Effect", "Quiet Engines", "Glass Hours", "Lunar Drift",
    "Iron Pastoral", "Copper Frequencies", "Dusk Protocol", "Velvet Collapse",
    "The Fading Light", "Magnetic Fields at Rest", "Silver Hours", "Rust Hymns",
    "Ember Roads", "The Still Point", "Fracture Lines", "Below the Canopy",
    "The Long Descent",
]

EXTRA_SONGS = [
    "Hollow Ground", "Pale Transit", "Signal Drift", "Neon Architecture",
    "Violet Engine", "The Burning Shore", "Crimson Hours", "Soft Collapse",
    "Ember Road", "The Quiet Map", "Glass Frequencies", "Lunar Parallax",
    "The Iron Shore", "Copper Silence", "Dusk Lines", "Velvet Fracture",
    "The Fading Atlas", "Magnetic Rain", "Silver Pastoral", "Rust Hymns",
    "Cascade Point", "Below the Still", "Fracture Map", "The Long Signal",
    "Burning Corridors", "Pale Machinery", "Drift Architecture", "Glass Hours",
    "Quiet Ember", "Iron Frequencies", "Neon Canopy", "Violet Descent",
    "The Copper Shore", "Signal Roads", "Hollow Engines", "Lunar Collapse",
    "Soft Parallax", "The Still Point", "Crimson Drift", "Rust Lines",
    "Ember Pastoral", "The Fading Map", "Magnetic Transit", "Silver Fracture",
    "Dusk Architecture", "Velvet Shore", "Below the Pale", "Glass Collapse",
    "The Burning Field", "Hollow Hours", "Copper Drift", "Neon Frequencies",
    "Violet Roads", "Iron Silence", "Lunar Machinery", "Soft Transit",
    "The Quiet Parallax", "Crimson Canopy", "Rust Architecture",
]

GENRES = [
    "Rock", "Indie Rock", "Post-Rock", "Progressive Rock", "Psychedelic Rock",
    "Jazz", "Hip-Hop", "Rap", "Electronic", "Ambient",
    "Dream Pop", "Shoegaze", "Post-Punk", "Folk", "R&B",
    "Soul", "Metal", "Noise Rock", "Experimental", "Alternative",
]


# ---------------------------------------------------------------------------
# Build entity lists
# ---------------------------------------------------------------------------

# --- Artists (50 total) ---
real_artist_names = list(dict.fromkeys(
    a for a, _, _ in real_album_pairs + real_song_pairs
))  # deduplicated, order-preserved
artist_names = real_artist_names[:50]
if len(artist_names) < 50:
    needed = 50 - len(artist_names)
    artist_names += EXTRA_ARTISTS[:needed]

# --- Albums (100 total) ---
# First: real albums from album_covers (up to 75)
albums = []  # [(title, artist_name, cover_filename, has_real_wiki)]
for artist, title, cover_f in real_album_pairs:
    albums.append((title, artist, cover_f, True))

# Fill to 100 with extra
random.shuffle(EXTRA_ALBUMS)
for i, title in enumerate(EXTRA_ALBUMS):
    cover_f = random.choice(album_cover_files)
    # assign to a random artist from our artist list
    artist = random.choice(artist_names)
    albums.append((title, artist, cover_f, False))
    if len(albums) >= 100:
        break

# If still under 100 (shouldn't happen), top up
while len(albums) < 100:
    cover_f = random.choice(album_cover_files)
    title = f"Untitled Record {len(albums)}"
    artist = random.choice(artist_names)
    albums.append((title, artist, cover_f, False))

albums = albums[:100]
random.shuffle(albums)

# --- Songs (100 total) ---
# First: real songs from song_covers
songs = []  # [(title, artist_name, cover_filename, has_real_wiki)]
for artist, title, cover_f in real_song_pairs:
    songs.append((title, artist, cover_f, True))

random.shuffle(EXTRA_SONGS)
for title in EXTRA_SONGS:
    cover_f = random.choice(song_cover_files)
    artist = random.choice(artist_names)
    songs.append((title, artist, cover_f, False))
    if len(songs) >= 100:
        break

while len(songs) < 100:
    cover_f = random.choice(song_cover_files)
    title = f"Untitled Track {len(songs)}"
    artist = random.choice(artist_names)
    songs.append((title, artist, cover_f, False))

songs = songs[:100]
random.shuffle(songs)


# ---------------------------------------------------------------------------
# Database insertion
# ---------------------------------------------------------------------------

conn = psycopg2.connect(**DB)
cur  = conn.cursor()

print("Truncating tables...")
cur.execute("""
    TRUNCATE TABLE
        song_genre, song_album, song_artist, album_artist,
        genre, song, album, artist
    RESTART IDENTITY CASCADE;
""")

# --- Genres ---
print(f"Inserting {len(GENRES)} genres...")
genre_ids = {}
for name in GENRES:
    cur.execute("INSERT INTO genre (name) VALUES (%s) RETURNING id", (name,))
    genre_ids[name] = cur.fetchone()[0]

# --- Artists ---
print(f"Inserting {len(artist_names)} artists...")
artist_ids = {}
for name in artist_names:
    # pick a random album cover as the artist image
    img_path = os.path.join(ALBUM_COVERS_DIR, random.choice(album_cover_files))
    img_bytes = read_bytes(img_path)
    cur.execute(
        "INSERT INTO artist (name, image, description) VALUES (%s, %s, %s) RETURNING id",
        (name, img_bytes, None)
    )
    artist_ids[name] = cur.fetchone()[0]

# --- Albums ---
print(f"Inserting {len(albums)} albums...")
album_ids = []  # list of (db_id, artist_name)
for title, artist_name, cover_f, has_wiki in albums:
    cover_path = os.path.join(ALBUM_COVERS_DIR, cover_f)
    cover_bytes = read_bytes(cover_path)
    link = wiki(title) if has_wiki else None
    year = random.randint(1965, 2024)
    cur.execute(
        "INSERT INTO album (name, cover, link, year) VALUES (%s, %s, %s, %s) RETURNING id",
        (title, cover_bytes, link, year)
    )
    album_db_id = cur.fetchone()[0]
    album_ids.append((album_db_id, artist_name))

    # link to primary artist
    if artist_name in artist_ids:
        cur.execute(
            "INSERT INTO album_artist (album_id, artist_id) VALUES (%s, %s)",
            (album_db_id, artist_ids[artist_name])
        )
    # optionally add a second artist
    if random.random() < 0.25:
        extra = random.choice(list(artist_ids.values()))
        # avoid duplicate
        cur.execute(
            """INSERT INTO album_artist (album_id, artist_id) VALUES (%s, %s)
               ON CONFLICT DO NOTHING""",
            (album_db_id, extra)
        )

all_album_db_ids = [aid for aid, _ in album_ids]

# --- Songs ---
print(f"Inserting {len(songs)} songs...")
mp3_list = [os.path.join(SONG_MP3S_DIR, f) for f in mp3_files]
for title, artist_name, cover_f, has_wiki in songs:
    cover_path = os.path.join(SONG_COVERS_DIR, cover_f)
    cover_bytes = read_bytes(cover_path)
    mp3_path    = random.choice(mp3_list)
    mp3_bytes   = read_bytes(mp3_path)
    link = wiki(title) if has_wiki else None
    year = random.randint(1965, 2024)
    cur.execute(
        "INSERT INTO song (name, cover, link, file, year) VALUES (%s, %s, %s, %s, %s) RETURNING id",
        (title, cover_bytes, link, mp3_bytes, year)
    )
    song_db_id = cur.fetchone()[0]

    # link to primary artist
    if artist_name in artist_ids:
        cur.execute(
            "INSERT INTO song_artist (song_id, artist_id) VALUES (%s, %s)",
            (song_db_id, artist_ids[artist_name])
        )
    # 1–2 extra artists
    for _ in range(random.randint(0, 2)):
        extra = random.choice(list(artist_ids.values()))
        cur.execute(
            "INSERT INTO song_artist (song_id, artist_id) VALUES (%s, %s) ON CONFLICT DO NOTHING",
            (song_db_id, extra)
        )

    # link to 1–3 random albums
    for alb_id in random.sample(all_album_db_ids, min(random.randint(1, 3), len(all_album_db_ids))):
        cur.execute(
            "INSERT INTO song_album (song_id, album_id) VALUES (%s, %s) ON CONFLICT DO NOTHING",
            (song_db_id, alb_id)
        )

    # link to 1–3 random genres
    chosen_genres = random.sample(list(genre_ids.values()), random.randint(1, 3))
    for gid in chosen_genres:
        cur.execute(
            "INSERT INTO song_genre (song_id, genre_id) VALUES (%s, %s) ON CONFLICT DO NOTHING",
            (song_db_id, gid)
        )

conn.commit()
cur.close()
conn.close()
print("Done! Database seeded successfully.")
