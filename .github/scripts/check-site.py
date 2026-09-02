#!/usr/bin/env python3
"""Pre-merge checks for the portfolio site.

Zero dependencies, no network. Run locally before pushing:

    python3 .github/scripts/check-site.py

Every check here guards something that fails *silently* in a browser — the
kind of regression a human reading a diff will not catch.
"""

import datetime as dt
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[2]
HTML = sorted(ROOT.glob("*.html"))

# Files Firebase Hosting will not upload (kept in step with firebase.json).
IGNORED_DIRS = {".git", ".github", ".firebase", "node_modules"}
IGNORED_NAMES = {"firebase.json", ".gitignore", ".DS_Store", "LICENSE"}
IGNORED_SUFFIXES = {".sh", ".md", ".py"}

PAYLOAD_BUDGET_KB = 600

failures: list[str] = []
notes: list[str] = []


def check(name, ok, detail=""):
    print(f"{'PASS' if ok else 'FAIL'}  {name}")
    if detail:
        for line in detail.strip().splitlines():
            print(f"        {line}")
    if not ok:
        failures.append(name)


def deployed_files():
    for path in ROOT.rglob("*"):
        if not path.is_file():
            continue
        rel = path.relative_to(ROOT)
        if set(rel.parts) & IGNORED_DIRS:
            continue
        if rel.name in IGNORED_NAMES or rel.suffix in IGNORED_SUFFIXES:
            continue
        yield rel, path


# --- 1. inline script / style ------------------------------------------------
# The CSP ships without 'unsafe-inline', so anything inline is dropped by the
# browser with no error. A <script> with a src= attribute is fine.
INLINE = re.compile(
    r"<script(?![^>]*\bsrc=)[^>]*>"
    r"|<style[\s>]"
    r"|\sstyle="
    r"|\son(?:click|load|error|mouseover|focus|blur|submit|change|input)=",
    re.I,
)
hits = []
for f in HTML:
    for n, line in enumerate(f.read_text(encoding="utf-8").splitlines(), 1):
        if INLINE.search(line):
            hits.append(f"{f.relative_to(ROOT)}:{n}: {line.strip()[:90]}")
check(
    "no inline script or style in HTML",
    not hits,
    "\n".join(hits) + "\n\nDrive dynamic values from a data- attribute with a "
    "stylesheet rule instead." if hits else "",
)

# --- 2. local references resolve --------------------------------------------
REF = re.compile(r'(?:href|src)="([^"]+)"')
broken = []
for f in HTML:
    for n, line in enumerate(f.read_text(encoding="utf-8").splitlines(), 1):
        for ref in REF.findall(line):
            if re.match(r"^(https?:|mailto:|data:|#)", ref) or ref == "/":
                continue
            target = ROOT / ref.lstrip("/").removeprefix("./").split("?")[0]
            if not target.exists():
                broken.append(f"{f.relative_to(ROOT)}:{n}: {ref}")
check("every local href/src resolves", not broken, "\n".join(broken))

# --- 3. external links carry rel="noopener" ---------------------------------
ANCHOR = re.compile(r"<a\b[^>]*>", re.I)
unsafe = []
for f in HTML:
    for tag in ANCHOR.findall(f.read_text(encoding="utf-8")):
        if 'target="_blank"' in tag and "noopener" not in tag:
            unsafe.append(f"{f.relative_to(ROOT)}: {tag[:90]}")
check('target="_blank" links carry rel="noopener"', not unsafe, "\n".join(unsafe))

# --- 4. payload budget -------------------------------------------------------
total = sum(p.stat().st_size for _, p in deployed_files())
kb = total / 1024
biggest = sorted(deployed_files(), key=lambda rp: rp[1].stat().st_size, reverse=True)[:3]
check(
    f"deployed payload within {PAYLOAD_BUDGET_KB} KB budget",
    kb <= PAYLOAD_BUDGET_KB,
    f"payload is {kb:.0f} KB\n"
    + "\n".join(f"{r} — {p.stat().st_size / 1024:.0f} KB" for r, p in biggest),
)
notes.append(f"payload {kb:.0f} KB of {PAYLOAD_BUDGET_KB} KB budget")

# --- 5. security.txt has not expired ----------------------------------------
sec = ROOT / ".well-known" / "security.txt"
if sec.exists():
    m = re.search(r"^Expires:\s*(\S+)", sec.read_text(encoding="utf-8"), re.M)
    if not m:
        check("security.txt has an Expires field", False, "RFC 9116 requires one")
    else:
        expires = dt.datetime.fromisoformat(m.group(1).replace("Z", "+00:00"))
        days = (expires - dt.datetime.now(dt.timezone.utc)).days
        check(
            "security.txt has not expired",
            days > 0,
            f"expired {-days} days ago — refresh the Expires date" if days <= 0 else "",
        )
        if 0 < days <= 30:
            notes.append(f"security.txt expires in {days} days")
        elif days > 30:
            notes.append(f"security.txt valid for {days} more days")

# --- summary -----------------------------------------------------------------
print()
for note in notes:
    print(f"note: {note}")
if failures:
    print(f"\n{len(failures)} check(s) failed: {', '.join(failures)}")
    sys.exit(1)
print("\nAll checks passed.")
