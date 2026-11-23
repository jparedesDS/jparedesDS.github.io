#!/usr/bin/env python3
"""Refresh data/repositories.json from GitHub and Hugging Face.

Run locally with `python scripts/update_repositories.py`, or automatically
during deploy (see .github/workflows/deploy.yml). Uses only the stdlib.
If either API fails, the existing data file is left untouched.
"""
import json
import os
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
USER = "jparedesDS"
OUT = ROOT / "data" / "repositories.json"


def fetch_json(url):
    headers = {"User-Agent": "jparedesds-portfolio", "Accept": "application/json"}
    token = os.environ.get("GH_TOKEN") or os.environ.get("GITHUB_TOKEN")
    if token:
        headers["Authorization"] = "Bearer " + token
    request = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(request, timeout=45) as response:
        return json.load(response)


def main():
    repos = []
    for page in range(1, 6):
        chunk = fetch_json(
            "https://api.github.com/users/%s/repos?per_page=100&page=%d"
            "&type=owner&sort=updated" % (USER, page))
        repos.extend(chunk)
        if len(chunk) < 100:
            break

    models = fetch_json(
        "https://huggingface.co/api/models?author=%s&limit=100" % USER)
    if not repos or not models:
        print("update_repositories: empty API response; keeping existing data")
        return 0

    data = {
        "github_user": USER,
        "repos": [{
            "name": r["name"],
            "full_name": r["full_name"],
            "url": r["html_url"],
            "description": r.get("description") or "",
            "language": r.get("language") or "",
            "stars": r.get("stargazers_count", 0),
            "forks": r.get("forks_count", 0),
            "archived": bool(r.get("archived")),
            "fork": bool(r.get("fork")),
            "updated": (r.get("pushed_at") or "")[:10],
        } for r in repos if not r.get("private")],
        "models": [{
            "id": m.get("id", ""),
            "url": "https://huggingface.co/" + m.get("id", ""),
            "task": m.get("pipeline_tag") or "",
            "downloads": m.get("downloads", 0),
            "likes": m.get("likes", 0),
        } for m in models],
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n",
                   encoding="utf-8")
    print("update_repositories: %d repos, %d models -> %s"
          % (len(data["repos"]), len(data["models"]), OUT))
    return 0


if __name__ == "__main__":
    sys.exit(main())
