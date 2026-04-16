# Speakers & Sessions

All the data in `sessions.json` and `speakers.json` is generated from the XLSX file downloaded from Sessionize and should not be edited directly. This raw data is then pre-processed though the `src/lib/sessionize.ts` file that can then be used from Astro components and pages.

## How to import data from Sessionize

- Go to [Sessionize](https://sessionize.com/) and from the "Export" section, download the XLSX file for "Sessions and speakers (advanced)" and download the "Accepted" version and download that XLSX file into `src/assets/sessionize/data-advanced.xlsx`.

- Then `cd` into this folder `src/assets/sessionize` and run the following python script (you may need to install the `pandas` package) to convert the XLSX spreadsheet from Sessionize to json

    ```
    ./convert-advanced.py
    ```

    This will update the `speakers.json` and `sessions.json` files.

## The `sessionize_feedback_links.json` file

Sessionize let's you add a "Feedback Link" to each session, but this is not included in the XLSX export and you can only manually export it as a zip of qr codes. Claude has helped here xD

https://claude.ai/share/ccb96adb-312d-479d-b540-aae8963b88b6

```bash
python3 << 'EOF'
import json, os, re
from PIL import Image
from pyzbar.pyzbar import decode

folder = "/home/claude/qr_images"
results = []

for fname in sorted(os.listdir(folder)):
    if not fname.endswith(".png"):
        continue

    # Strip extension, then split on _
    # Pattern: <session-name>_<speaker>_<session_id>_feedback-code.png
    base = fname.replace("_feedback-code.png", "")
    parts = base.split("_")
    # Last part is session_id (numeric), rest is session_name _ speaker
    session_id = parts[-1]
    speaker = parts[-2]
    session_name = "_".join(parts[:-2])

    path = os.path.join(folder, fname)
    img = Image.open(path)
    codes = decode(img)
    url = codes[0].data.decode("utf-8") if codes else None

    results.append({
        "filename": fname,
        "session_id": session_id,
        "session_name": session_name,
        "speaker": speaker,
        "url": url
    })

# Preview first 3
for r in results[:3]:
    print(r)

out = json.dumps(results, indent=2, ensure_ascii=False)
with open("/mnt/user-data/outputs/devfest_pisa_2026_qr_links.json", "w") as f:
    f.write(out)
print(f"\nDone: {len(results)} entries")
EOF
```

Also note that the `session_name` field in the feedback links is not exactly the same as the `id` field in the sessions as it is slugged slightly differently and truncated to less characters. To match them, we remove `-` and use `startsWith` matching instead of exact matching.

This logic is implemented in `src/lib/astro/sessionize.ts`, there are also error checks to log any sessions that have feedback links but don't match any session, and vice versa.
