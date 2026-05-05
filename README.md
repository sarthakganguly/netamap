# NetaMap - Sansad & ECI Scraper

NetaMap is a full-stack platform designed to crawl, structure, and visualize data from the official Indian Parliament portal ([sansad.in](https://sansad.in)) and the Election Commission of India (ECI) affidavit portal.

## 🚀 Features

- **Deep Member Profiles**: Exhaustive biographical, political, and contact data for all 543 Lok Sabha members.
- **ECI Candidate Scraper**: Scrapes candidate affidavits and profile metadata from the ECI portal.
- **Form 26 OCR Parser**: Advanced PDF parsing using Tesseract.js and Poppler (`pdftoppm`) to extract structured financial and legal data from scanned candidate affidavits.
- **Local Image Storage**: Downloads and stores profile photos as **Base64** strings in SQLite, eliminating external fetches and privacy/CORS concerns.
- **Unified Data Access**: A clean REST API to access both elected members and candidate data.

## 🛠️ Technology Stack

- **Backend**: Node.js, Express, SQLite3 (Modular Architecture)
- **Frontend**: React 19, TypeScript, Vite (Componentized Architecture)
- **OCR/Automation**: Puppeteer (Stealth), Tesseract.js, Poppler
- **Orchestration**: Docker, Docker Compose

## 📚 Documentation

- [**Data Schemas**](./docs/schemas.md): Detailed JSON schemas for all data entities.
- [**ECI Scraper Guide**](./docs/eci-scraper.md): Technical details on the ECI scraping and OCR pipeline.
- [**Sansad Scraper Guide**](./docs/sansad-scraper.md): Details on the Indian Parliament data extraction.

## 🚦 Getting Started

### 1. Build and Start
Run the following command to build and launch the services:

```bash
docker-compose up --build -d
```

### 2. Sync Data
Run the scrapers inside the container to populate your local database:

```bash
# For Sansad (MPs)
docker exec -it netamap-backend node src/scrapers/sansad_scraper.js

# For ECI (Candidates)
docker exec -it netamap-backend node src/scrapers/eci_scraper.js
```

### 3. Access
- **Frontend**: `http://localhost:5173`
- **API (Candidates)**: `http://localhost:5000/api/eci/candidates`

---
*Note: This project is intended for educational and research purposes. Please respect the robots.txt and rate limits of the source portals.*
