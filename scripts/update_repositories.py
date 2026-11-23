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

    enriched_models = []
    for model in models:
        model_id = model.get("id", "")
        details = {}
        if model_id:
            try:
                details = fetch_json(
                    "https://huggingface.co/api/models/" + model_id)
            except Exception:
                details = {}
        card = details.get("cardData") or {}
        base = card.get("base_model") or ""
        if isinstance(base, list):
            base = ", ".join(str(item) for item in base)
        base = base.replace("base_model:", "").strip()
        task = (model.get("pipeline_tag") or card.get("pipeline_tag") or "")
        if not task:
            tags = [str(tag).lower() for tag in (model.get("tags") or [])]
            if "object-detection" in tags or "object detection" in tags:
                task = "object-detection"
            elif "image-classification" in tags:
                task = "image-classification"
        labels = []
        for tag in (model.get("tags") or []):
            tag = str(tag)
            if tag.startswith(("base_model", "region:", "en", "es")):
                continue
            if tag in ("yolo",) or ":" in tag:
                continue
            labels.append(tag)
            if len(labels) == 3:
                break
        family = ""
        lowered = model_id.lower()
        for candidate in ("yolo11", "yolo12", "yolo10", "yolo9", "yolov11",
                          "yolov10", "yolov9"):
            if candidate in lowered:
                family = candidate.upper().replace("YOLO", "YOLO ")
                break
        enriched_models.append({
            "id": model_id,
            "url": "https://huggingface.co/" + model_id,
            "task": task,
            "base": base,
            "family": family,
            "tags": labels,
            "downloads": model.get("downloads", 0),
            "likes": model.get("likes", 0),
            "updated": (details.get("lastModified") or "")[:10],
        })

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
        "models": enriched_models,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n",
                   encoding="utf-8")
    print("update_repositories: %d repos, %d models -> %s"
          % (len(data["repos"]), len(data["models"]), OUT))
    return 0


if __name__ == "__main__":
    sys.exit(main())
