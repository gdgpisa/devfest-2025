#!/usr/bin/env python3

import sys
import pandas as pd
import json
import datetime


def serialize_datetime(obj):
    if isinstance(obj, (pd.Timestamp, datetime.datetime, datetime.date)):
        return obj.isoformat()
    return obj


def xlsx_to_json(input_file, output_file):
    try:
        df = pd.read_excel(input_file, sheet_name=None)  # Read all sheets

        if len(df) == 1:
            data = list(df.values())[0].fillna(None).applymap(
                serialize_datetime).to_dict(orient='records')
        else:
            data = {
                sheet: df[sheet].fillna(None).applymap(serialize_datetime).to_dict(orient='records') for sheet in df
            }

        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=4, ensure_ascii=False)

        print(f"Conversion successful: {output_file}")
    except Exception as e:
        print(f"Error: {e}")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python script.py <input.xlsx> <output.json>")
        sys.exit(1)

    xlsx_to_json(sys.argv[1], sys.argv[2])
