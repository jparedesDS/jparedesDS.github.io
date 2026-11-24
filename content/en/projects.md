+++
title = "Projects"
translationKey = "projects"
user = "projects"
showMetadata = false
+++

Nine projects, each with an image, a short explanation and its links. Everything here is live or in production.

<div class="projectGallery">

<section class="projectRow">
<div class="projectBody">
<h3>Industrial computer vision</h3>
<p>YOLO11 detectors for fluorescent penetrant indications and welding defects, published as 10+ models on Hugging Face and used in real inspection work.</p>
<ul class="projectChips"><li>YOLO11</li><li>Hugging Face</li><li>Production</li></ul>
<p class="projectLinks"><a href="https://huggingface.co/jparedesDS/fluorescent-penetrant-inspection" target="_blank" rel="noopener noreferrer">Penetrant model</a><a href="https://huggingface.co/jparedesDS" target="_blank" rel="noopener noreferrer">More models</a><a href="https://github.com/jparedesDS/welding-defects-detection" target="_blank" rel="noopener noreferrer">Welding detector</a></p>
</div>
<img src="/images/case-vision.svg" alt="Diagram of the industrial vision pipeline: camera frames, labelled dataset, YOLO11 and inspection." width="320" height="180" loading="lazy">
</section>

<section class="projectRow">
<div class="projectBody">
<h3>DocFlow — document control</h3>
<p>Internal SaaS built end to end: a FastAPI backend with 21 routers and 24 services, a React frontend with 24 screens, DocuSign signatures and Docker + CI deployment. The public repository is DocFlow Lite.</p>
<ul class="projectChips"><li>FastAPI</li><li>React</li><li>DocuSign</li><li>Docker</li></ul>
<p class="projectLinks"><a href="https://github.com/jparedesDS/docflow" target="_blank" rel="noopener noreferrer">DocFlow Lite on GitHub</a></p>
</div>
<img src="/images/case-docflow.svg" alt="DocFlow architecture: email and the ERP connected to FastAPI, React and DocuSign, deployed with Docker and CI." width="320" height="180" loading="lazy">
</section>

<section class="projectRow">
<div class="projectBody">
<h3>subany.video — subtitles in the browser</h3>
<p>Live subtitles processed locally with Whisper, Silero VAD and ONNX/WebGPU, with no servers. Fixed 15.3 s delay and a median subtitle offset of 0–40 ms.</p>
<ul class="projectChips"><li>Whisper</li><li>Silero VAD</li><li>WebGPU</li></ul>
<p class="projectLinks"><a href="https://subany.video/" target="_blank" rel="noopener noreferrer">Open subany.video</a><a href="/en/blog/2026/11/09/how-subany-video-works/">How it works</a></p>
</div>
<img src="/images/case-subany.png" alt="The subany.video home page with the field for pasting a stream link to watch it subtitled." width="320" height="180" loading="lazy">
</section>

<section class="projectRow">
<div class="projectBody">
<h3>CleanYourPhone</h3>
<p>Reversible Android debloat without root: disables system apps and lets you restore the device to its original state.</p>
<ul class="projectChips"><li>Android</li><li>No root</li></ul>
<p class="projectLinks"><a href="https://www.cleanyourphone.org/" target="_blank" rel="noopener noreferrer">Open CleanYourPhone</a></p>
</div>
<img src="/images/cleanyourphone-thumb.png" alt="The CleanYourPhone interface listing the system apps that can be disabled." width="320" height="180" loading="lazy">
</section>

<section class="projectRow">
<div class="projectBody">
<h3>CleanYourMail</h3>
<p>Reversible inbox cleanup: organises and removes old messages without losing the thread of a conversation.</p>
<ul class="projectChips"><li>Email</li><li>Python</li></ul>
<p class="projectLinks"><a href="https://www.cleanyourmail.org/" target="_blank" rel="noopener noreferrer">Open CleanYourMail</a></p>
</div>
<img src="/images/cleanyourmail-thumb.png" alt="The CleanYourMail screen with the inbox summary and cleanup options." width="320" height="180" loading="lazy">
</section>

<section class="projectRow">
<div class="projectBody">
<h3>Pro POV CS2</h3>
<p>Autonomous esports content pipeline for Counter-Strike 2: clips, summaries and publishing across social networks.</p>
<ul class="projectChips"><li>CS2</li><li>Esports</li><li>Automation</li></ul>
<p class="projectLinks"><a href="https://propovcs2.com/" target="_blank" rel="noopener noreferrer">Open Pro POV</a><a href="https://www.tiktok.com/@propov_cs2" target="_blank" rel="noopener noreferrer">TikTok</a></p>
</div>
<img src="/images/propov-cs2.png" alt="The Pro POV CS2 cover with its logo and examples of Counter-Strike 2 clips." width="320" height="180" loading="lazy">
</section>

<section class="projectRow">
<div class="projectBody">
<h3>HLTV Team &amp; Player Stats Scraper</h3>
<p>Scraping and analysis of CS2 team and player statistics from HLTV.</p>
<ul class="projectChips"><li>Python</li><li>Scraping</li><li>CS2</li></ul>
<p class="projectLinks"><a href="https://github.com/jparedesDS/hltv-scraper" target="_blank" rel="noopener noreferrer">Code on GitHub</a></p>
</div>
<img src="/images/myhltv.png" alt="A sample of the CS2 statistics table extracted by the HLTV scraper." width="320" height="180" loading="lazy">
</section>

<section class="projectRow">
<div class="projectBody">
<h3>Technical Drawing Data Extraction</h3>
<p>Deep learning to identify entities in DXF technical drawings and automate their documentation.</p>
<ul class="projectChips"><li>Deep Learning</li><li>DXF</li><li>OCR</li></ul>
<p class="projectLinks"><a href="https://github.com/jparedesDS/extract-data-dxf" target="_blank" rel="noopener noreferrer">Code on GitHub</a></p>
</div>
<img src="/images/mydxf.png" alt="A DXF technical drawing with the detected entities highlighted." width="320" height="180" loading="lazy">
</section>

<section class="projectRow">
<div class="projectBody">
<h3>CS2 Weapon Detection</h3>
<p>Detector for 19 classes of weapons in Counter-Strike 2 with YOLO12m and a model published on Hugging Face.</p>
<ul class="projectChips"><li>YOLO12m</li><li>CS2</li><li>Hugging Face</li></ul>
<p class="projectLinks"><a href="https://github.com/jparedesDS/cs2-yolo12m-weapon-detection" target="_blank" rel="noopener noreferrer">Code on GitHub</a><a href="https://huggingface.co/jparedesDS/cs2-yolo12m-weapon-detection" target="_blank" rel="noopener noreferrer">Model on Hugging Face</a></p>
</div>
<img src="/images/ocr-identification.png" alt="A Counter-Strike 2 capture with weapon names detected using OCR." width="320" height="180" loading="lazy">
</section>

</div>

More repositories and models on [GitHub](https://github.com/jparedesDS) and [Hugging Face](https://huggingface.co/jparedesDS).
