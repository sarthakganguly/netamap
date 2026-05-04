# ECI Candidate Scraper & Form 26 Parser

This tool scrapes candidate data from the Election Commission of India (ECI) portal and parses scanned Form 26 affidavits using OCR.

## Setup

The tool runs within the Docker environment to handle Puppeteer, Chromium, and OCR system dependencies.

1. **Build the container (required for Poppler/OCR tools):**
   ```bash
   docker-compose up -d --build
   ```

2. **Run the ECI Scraper:**
   ```bash
   docker exec -it netamap-backend node eci_scraper.js
   ```

## Technical Implementation

- **Web Scraping**: Uses `puppeteer-extra` with the `stealth` plugin to evade detection on the ECI affidavit portal.
- **PDF Processing**: 
  - Scanned PDFs are converted to 300 DPI JPEG images using `pdftoppm` (Poppler).
  - Images are processed page-by-page using **Tesseract.js**.
- **Data Mapping**: Extracted text is mapped to a structured JSON schema (`ElectoralAffidavitForm26`) using regular expressions and keyword matching.
- **Storage**: Data is persisted in `eci_candidates` (profile info) and `eci_affidavits` (legal/financial data) tables.

## Workflow

1. **Crawl**: Navigates to the ECI list, finds candidates with "View More" links.
2. **Detail Scrape**: Extracts full profile info (Name, Party, Constituency, Age, etc.).
3. **Download**: Clicks the Download button and waits for the PDF to arrive in the local `downloads/` folder.
4. **OCR**: Converts PDF to images and extracts all text.
5. **Database**: Saves the structured JSON and specific metrics to `sansad.db`.
