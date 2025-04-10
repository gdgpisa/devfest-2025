# Speakers & Sessions

All the data in `sessions.json` and `speakers.json` is generated from the XLSX file downloaded from Sessionize and should not be edited directly. This raw data is then pre-processed though the `src/lib/sessionize.ts` file that can then be used from Astro components and pages.

## How to import data from Sessionize

- Go to [Sessionize](https://sessionize.com/) and from the "Export" section, download the XLSX file for "Sessions and speakers (advanced)" and download the "Accepted" version and download that XLSX file into `src/assets/speakers/data-advanced.xlsx`.

- Then `cd` into this folder `src/assets/speakers` and run the following python script (you may need to install the `pandas` package) to convert the XLSX spreadsheet from Sessionize to json

    ```
    ./convert-advanced.py
    ```

    This will update the `speakers.json` and `sessions.json` files.
