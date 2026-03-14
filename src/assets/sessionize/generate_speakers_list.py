#!/usr/bin/env -S uv run --script
import json
from pathlib import Path

# Load JSON files
sessions_file = Path(__file__).parent / "sessions.json"
speakers_file = Path(__file__).parent / "speakers.json"

with open(sessions_file) as f:
    sessions = json.load(f)

with open(speakers_file) as f:
    speakers = json.load(f)

# Create speaker dict for easy lookup
speakers_dict = {s["Speaker Id"]: s for s in speakers}

# Map language codes
lang_map = {
    "Italian": "🇮🇹",
    "English": "🇬🇧",
    "Italian, English": "🇮🇹🇬🇧",
    "English, Italian": "🇮🇹🇬🇧",
}

# Filter scheduled sessions (those with Room and Scheduled At)
scheduled = [s for s in sessions if s.get("Room") and s.get("Scheduled At")]

# Collect entries with speaker info
entries = []
for session in scheduled:
    speaker_ids = [sid.strip() for sid in session["Speaker Ids"].split(",")]

    # Get unique speakers for this session
    session_speakers = []
    for sid in speaker_ids:
        if sid in speakers_dict:
            session_speakers.append(speakers_dict[sid])

    if not session_speakers:
        continue

    # Format speaker names and affiliations
    speaker_names = " & ".join([f"{s['FirstName']} {s['LastName']}" for s in session_speakers])

    # Get all taglines
    affiliation = " & ".join([s.get("TagLine", "").strip() for s in session_speakers if s.get("TagLine")])

    # Get language with emoji
    lang = session["Language"]
    lang_emoji = lang_map.get(lang, "🇮🇹")

    # Collect taglines
    taglines = [s.get("TagLine", "").strip() if s.get("TagLine") else "" for s in session_speakers]
    combined_bio = " ".join([t for t in taglines if t])

    entries.append(
        {
            "names": speaker_names,
            "affiliation": affiliation,
            "title": session["Title"],
            "lang_emoji": lang_emoji,
            "bio": combined_bio,
            "sort_key": session["Title"].lower(),
        }
    )

# Sort by title
entries.sort(key=lambda e: e["sort_key"])

# Generate markdown
for entry in entries:
    print(f"- **{entry['names']}** — {entry['affiliation']}\n")
    print(f"    **_{entry['title']}_** - talk language {entry['lang_emoji']}\n")
