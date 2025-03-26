#!/usr/bin/env python3

import sys
import pandas as pd
import json
import datetime


def serialize_datetime(obj):
    if isinstance(obj, (pd.Timestamp, datetime.datetime, datetime.date)):
        return obj.isoformat()
    return obj


sessions = pd.read_excel("./data-advanced.xlsx",
                         sheet_name="Accepted sessions")
speakers = pd.read_excel("./data-advanced.xlsx",
                         sheet_name="Accepted speakers")

sessions.to_json("./sessions.json",
                 orient="records", indent=2, force_ascii=False,
                 date_format="iso")

speakers.to_json("./speakers.json",
                 orient="records", indent=2, force_ascii=False,
                 date_format="iso")
