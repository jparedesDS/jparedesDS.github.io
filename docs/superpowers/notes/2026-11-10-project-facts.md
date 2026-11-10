# Project facts — 2026-11-10

Source of truth for the 38 English project pages created in T6:

- Old category pages: `projects/ai-vision/index.md`, `projects/data-automation/index.md`, `projects/products/index.md`, `projects/esports/index.md` (kept; T14 converts them to redirects).
- Public READMEs fetched from `https://raw.githubusercontent.com/jparedesDS/<repo>/HEAD/README.md` on 2026-11-10. All fetches below returned content.
- `_data/en/home.yml` for the featured `subany.video` description (the `docs/traspaso.md` / `docs/fase0/informe.md` files referenced by the plan are not present in this worktree).
- No private repository was inspected.

## README status

| Project | Repository README | Sections written |
|---|---|---|
| ocr-weapon-detection-cs2 | fetched | Overview, Problem, Main features, Stack |
| fluorescent-penetrant-inspection | fetched | Overview, Problem, Main features, Stack |
| dxf-data-extraction | fetched | Overview, Problem, Main features, Stack |
| welding-defects-detector | fetched | Overview, Problem, Main features, Stack |
| futurama-image-classification | fetched | Overview, Problem, Main features, Stack |
| ai-yolo-object-detection | fetched | Overview, Problem, Main features, Stack |
| lol-map-tracking | fetched | Overview, Problem, Main features, Stack |
| cs2-weapon-detector-yolo12m | not fetched (model release, old entry only) | Model release |
| welding-defects-detector-yolo11x | not fetched (model release) | Model release |
| liquid-penetrant-test-yolo11l | not fetched (model release) | Model release |
| cs2-players-detector-yolo12s | not fetched (model release) | Model release |
| cs2-players-detector-yolov9-v10-v11 | not fetched (model release) | Model release |
| valorant-players-detector | not fetched (model release) | Model release |
| fortnite-players-detector | not fetched (model release) | Model release |
| overwatch-2-players-detector | not fetched (model release) | Model release |
| deadlock-players-detector | not fetched (model release) | Model release |
| lol-map-tracking-yolo11 | not fetched (model release) | Model release |
| docflow-saas | fetched | Overview, Problem, Main features, Stack |
| tableau-documentation-flow | no repository; old entry and Tableau Public link | Overview, Problem, Main features, Stack |
| docucontrol | private | Overview + private blockquote |
| email-mapi-automation | fetched | Overview, Problem, Main features, Stack |
| eipsa-erp | fetched | Overview, Problem, Main features, Stack |
| hltv-scraper | fetched | Overview, Problem, Main features, Stack |
| twitter-sentiment-emojis | fetched | Overview, Problem, Main features, Stack |
| twitter-sentiment-analysis | fetched | Overview, Problem, Main features, Stack |
| traffic-accidents-madrid | fetched (dataset documentation only; no stack stated) | Overview, Problem, Main features (Stack omitted) |
| data-wrangling-titanic | fetched (short README: metrics only) | Overview, Problem, Main features, Stack |
| monitoring-report-automation | fetched | Overview, Problem, Main features, Stack |
| subany-video | no public repository README used; `_data/en/home.yml` | Overview, Problem, Main features (Stack omitted) |
| cleanyourmail | fetched | Overview, Problem, Main features, Stack |
| cleanyourphone | fetched | Overview, Problem, Main features, Stack |
| workshop-scheduler | fetched | Overview, Problem, Main features, Stack |
| trtw-tv | fetched | Overview, Problem, Main features, Stack |
| claude-telegram-bot | fetched | Overview, Problem, Main features, Stack |
| polymarket-autobetting | private | Overview + private blockquote |
| pro-pov-cs2 | private | Overview + private blockquote |
| clutchbot-ai | private | Overview + private blockquote |
| cs2-vrs-predictions | private | Overview + private blockquote |

## Specific facts used

- **ocr-weapon-detection-cs2:** Tesseract OCR, OpenCV, NumPy, MSS; weapon list AK-47, M4A1-S, M4A1, AWP, FAMAS, Galil, Desert Eagle, USP-S, Glock-18.
- **fluorescent-penetrant-inspection:** YOLO11l, single label `defecto`, Hugging Face model card with confusion matrix, labels and results.
- **dxf-data-extraction:** lines, circles, arcs, polylines, text, dimensions; 2D/3D; `ezdxf`; custom output DXF and vector representation.
- **welding-defects-detector:** YOLO11x; labels `Defect`, `Welding Line`, `Workpiece`, `porosity`.
- **futurama-image-classification:** Keras CNN MCRMSE 0.12527; ResNet152/ImageNet MCRMSE 0.09149; 2nd public / 3rd private; Keras/TensorFlow, PyTorch/torchvision.
- **ai-yolo-object-detection:** index of metallurgical, CS2 (YOLOv9/v10), Valorant, Deadlock, Overwatch 2 and Fortnite models; MIT license.
- **lol-map-tracking:** YOLO11m, full champion label set.
- **docflow-saas:** DocFlow Lite; ERP PostgreSQL read-only with Excel fallback; eight portal parsers (eGesDoc, AYESA, SACYR Proarc, PRODOC/Wood, Document Space/Hyundai, GAIA, Aconex, Sendoc); 10-minute portal download; never overwrites archived revisions; VPR; three-level claims; DocuSign; Python 3.12+, CustomTkinter, psycopg2, pandas, openpyxl, calamine, APScheduler, keyring, requests/truststore, anthropic.
- **tableau-documentation-flow:** monitors document inflow, processing and delivery; Tableau Public.
- **email-mapi-automation:** 30-minute polling 07:30–17:00; HTML table to pandas; xlsx attachment; database update after send; pandas, NumPy, BeautifulSoup, xlsxwriter, win32com.
- **eipsa-erp:** role-based Windows ERP; PostgreSQL 15 local server; Python 3.11, PyQt6, Tkinter, pandas, psycopg2, Matplotlib, openpyxl, docxtpl, PyFPDF, PyInstaller.
- **hltv-scraper:** Selenium, BeautifulSoup, undetected-chromedriver; performance score weights 30/30/20/20 over win rate, K/D, Rating 2.1 and HLTV Impact.
- **twitter-sentiment-emojis:** pandas, NumPy, Matplotlib, Seaborn, NLTK, Jupyter Notebook.
- **twitter-sentiment-analysis:** tweepy, pandas, NumPy, Matplotlib, Seaborn, TextBlob or VADER.
- **traffic-accidents-madrid:** dataset structure, accident types and severity codes; analysis and predictions from the old entry. No stack was stated, so the Stack section was omitted.
- **data-wrangling-titanic:** pandas cleaning/analysis; logistic regression; accuracy 0.8603 and ROC-AUC 0.9185 from the README.
- **monitoring-report-automation:** pandas, xlsxwriter, openpyxl, tqdm, aspose-cells; sheets ALL DOC., ENVIADOS, SIN ENVIAR, COMENTADOS, STATUS.
- **subany-video:** from `_data/en/home.yml`: live subtitles and translation for streams and videos, processed privately in the browser, no account needed. Links limited to `https://subany.video/` and the tutorial; no `subtitle.me`; no open-source claim; no stack or metrics.
- **cleanyourmail:** headers only; categories newsletter/promotion/social/notification/cold/spam/transactional/personal; protected-mail list; `plan.json`; COPYUID/Message-ID journal and `undo`; RFC 8058/mailto/manual unsubscribe; Gmail filter XML and Sieve export; Python 3.11+ stdlib, IMAP/SMTP, fake IMAP test server.
- **cleanyourphone:** `pm disable-user --user 0`, `pm enable`; backup; protected packages and role checks; batches of five; profiles across Google, Samsung, Xiaomi, Redmi, POCO and OnePlus; optional Private DNS; Python 3.10+ stdlib CLI and raw adb commands.
- **workshop-scheduler:** Node.js 22+ `node:sqlite/http/crypto`, zero dependencies; day/week agenda by bay; appointment lifecycle; ITV alerts; WhatsApp/email notifications; admin/reception/mechanic roles; CSV reports; daily SQLite backups.
- **trtw-tv:** Manifest V3, Chrome 138+; Whisper tiny.en/base.en/small.en via transformers.js; WebGPU/WASM; Silero VAD; local agreement; hallucination filter; Chrome Translator API + Opus-MT; 1.5–3 s delay; glossary/context/bilingual.
- **claude-telegram-bot:** Python 3.11+; Claude Code hooks to localhost:7483; Telegram Bot API; approvals, notifications, session monitoring, /status /mute /ask.
- **Private projects:** docucontrol, polymarket-autobetting, pro-pov-cs2, clutchbot-ai and cs2-vrs-predictions use only the old description plus `> Private repository. Implementation details are not disclosed.` No stack, architecture, feature list or metric was added.

## Deliberate omissions

- Stack omitted for `traffic-accidents-madrid` and `subany-video` because no verified stack was available.
- No metrics were copied from the old marketing copy when the README did not confirm them; e.g. CleanYourMail test counts and CleanYourPhone profile counts were left out.
- Model-release pages contain only the task, YOLO version and year from the old entries plus the indexing note.
