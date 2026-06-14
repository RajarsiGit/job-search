---
name: sync-docs
description: Update CLAUDE.md and README.md to reflect any structural changes made this session (new API sources, link boards, commands, data shapes, file structure, constraints, etc.)
---

Run `git diff HEAD` to see what changed this session.

Then read `CLAUDE.md` and `README.md`.

If any changes are stale or missing in either file — such as:
- New or removed API sources (`API_SOURCES`)
- New or removed link boards (`LINK_BOARDS`) or categories
- Changes to the job object shape
- New components or renamed files
- Changed commands or scripts
- Updated localStorage keys
- New known constraints

— update the relevant sections to keep them accurate.

**Only edit if something is genuinely stale.** Skip entirely if the diff is purely cosmetic (styles, copy tweaks, color changes) or unrelated to anything documented.
