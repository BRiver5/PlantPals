"""End-to-end smoke test hitting the running server on 127.0.0.1:8071.

Run:  .venv/Scripts/python.exe smoke_test.py
Exercises every endpoint against the real backend (no mocks).
"""
from __future__ import annotations

import io
import sys
import urllib.error
import urllib.request
import json

from PIL import Image

BASE = "http://127.0.0.1:8071"
DEV = "smoketest-device-0001"
FAILS: list[str] = []


def req(method: str, path: str, *, body=None, headers=None, raw=None, ctype=None):
    url = f"{BASE}{path}"
    h = {"X-Device-Id": DEV}
    if headers:
        h.update(headers)
    if body is not None:
        data = json.dumps(body).encode()
        h["Content-Type"] = "application/json"
    elif raw is not None:
        data = raw
        if ctype:
            h["Content-Type"] = ctype
    else:
        data = None
    r = urllib.request.Request(url, data=data, headers=h, method=method)
    try:
        with urllib.request.urlopen(r) as resp:
            payload = resp.read()
            return resp.status, (json.loads(payload) if payload else None)
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()


def check(name: str, cond: bool, extra=""):
    tag = "PASS" if cond else "FAIL"
    print(f"[{tag}] {name} {extra}")
    if not cond:
        FAILS.append(name)


# 1. health
s, b = req("GET", "/health")
check("health", s == 200 and b["status"] == "ok")

# 2. catalog seeded 40+
s, b = req("GET", "/catalog")
check("catalog >=40", s == 200 and len(b) >= 40, f"({len(b) if isinstance(b, list) else b} species)")

s, b = req("GET", "/catalog?q=snake")
check("catalog search", s == 200 and any("Snake" in x["common_name"] for x in b))

# 3. missing device header rejected
s, b = req("GET", "/plants", headers={"X-Device-Id": ""})
check("missing device -> 400", s == 400)

# 4. empty list for fresh device
s, b = req("GET", "/plants")
check("empty plants list", s == 200 and b == [])

# 5. validation error
s, b = req("POST", "/plants", body={"name": "", "interval_days": 7})
check("blank name -> 422", s == 422)

# 6. photo upload
img = Image.new("RGB", (400, 300), (91, 140, 90))
buf = io.BytesIO()
img.save(buf, format="JPEG")
boundary = "----smoke"
parts = (
    f"--{boundary}\r\n"
    'Content-Disposition: form-data; name="file"; filename="p.jpg"\r\n'
    "Content-Type: image/jpeg\r\n\r\n"
).encode() + buf.getvalue() + f"\r\n--{boundary}--\r\n".encode()
s, b = req("POST", "/photos", raw=parts, ctype=f"multipart/form-data; boundary={boundary}")
check("photo upload", s == 201 and b["photo_url"].endswith((".jpg", ".png")), b if s != 201 else "")
photo_url = b["photo_url"] if s == 201 else None

# 7. create plant
s, b = req("POST", "/plants", body={
    "name": "Test Monstera", "species": "Monstera deliciosa", "interval_days": 7,
    "water_amount_ml": 400, "location": "Living room", "photo_url": photo_url,
    "care_notes": "Bright indirect light.",
})
check("create plant", s == 201 and b["id"] > 0 and b["next_due_at"] > b["created_at"])
pid = b["id"]

# 8. list has 1
s, b = req("GET", "/plants")
check("list has 1", s == 200 and len(b) == 1)

# 9. get detail
s, b = req("GET", f"/plants/{pid}")
check("get detail", s == 200 and b["id"] == pid and b["logs"] == [])

# 10. update interval recomputes next_due
s, b = req("PATCH", f"/plants/{pid}", body={"interval_days": 3})
check("patch interval", s == 200 and b["interval_days"] == 3)

# 11. water it
s, b = req("POST", f"/plants/{pid}/water")
check("water plant", s == 201 and b["last_watered_at"] is not None and len(b["logs"]) == 1)
due_after = b["next_due_at"]

# 12. water again
s, b = req("POST", f"/plants/{pid}/water")
check("water again", s == 201 and len(b["logs"]) == 2)

# 13. history
s, b = req("GET", f"/plants/{pid}/history")
check("history len 2", s == 200 and len(b) == 2)
log_id = b[0]["id"]

# 14. stats
s, b = req("GET", "/stats")
check("stats totals", s == 200 and b["total_plants"] == 1 and b["waterings_total"] == 2)
check("stats streak >=1", b["current_streak"] >= 1)
check("stats weekly buckets", len(b["weekly"]) == 8)

# 15. delete a watering log re-anchors
s, b = req("DELETE", f"/plants/{pid}/history/{log_id}")
check("delete log", s == 204)
s, b = req("GET", f"/plants/{pid}/history")
check("history len 1", s == 200 and len(b) == 1)

# 16. cross-device isolation
s, b = req("GET", f"/plants/{pid}", headers={"X-Device-Id": "other-device"})
check("cross-device 404", s == 404)

# 17. delete plant cascades
s, b = req("DELETE", f"/plants/{pid}")
check("delete plant", s == 204)
s, b = req("GET", "/plants")
check("list empty again", s == 200 and b == [])
s, b = req("GET", "/stats")
check("stats reset", s == 200 and b["total_plants"] == 0 and b["waterings_total"] == 0)

print()
if FAILS:
    print(f"{len(FAILS)} FAILURES: {FAILS}")
    sys.exit(1)
print("ALL SMOKE TESTS PASSED")
