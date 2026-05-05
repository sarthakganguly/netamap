# ECI Candidate Scraper & Form 26 Parser

This tool scrapes candidate data from the Election Commission of India (ECI) portal and parses scanned Form 26 affidavits using OCR.

## Features

- **Interactive Selection**: Choose specific elections, states, and constituencies or process "ALL" through a terminal-based CLI.
- **Parallel OCR Pipeline**: Scrapes web data and downloads PDFs in the foreground while parsing affidavits in the background using an asynchronous worker queue.
- **Stealth Automation**: Uses `puppeteer-extra` with the `stealth` plugin to evade detection.
- **Noise Reduction**: Tesseract and Poppler logs are silenced for a clean terminal experience.

## Setup

The tool runs within the Docker environment to handle Puppeteer, Chromium, and OCR system dependencies.

1. **Build the container:**
   ```bash
   docker-compose up -d --build
   ```

2. **Run the Interactive Scraper:**
   ```bash
   docker exec -it netamap-backend node src/scrapers/eci_scraper.js
   ```

## Technical Implementation

- **Web Scraping**: Navigates 5 levels of dependent dropdowns using Puppeteer.
- **OCR Engine**:
  - PDFs are converted to high-resolution JPEGs via `pdftoppm`.
  - **Tesseract.js** processes images with a concurrency limit of 4.
- **Data Mapping**: Maps extracted text to the `ElectoralAffidavitForm26` JSON schema.

## Resource Note
Running 4 parallel OCR workers is CPU-intensive. If your environment is low on RAM/CPU, you can adjust `MAX_OCR_CONCURRENCY` in `src/scrapers/eci_scraper.js`.
