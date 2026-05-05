# NetaMap - Sansad & ECI Scraper

NetaMap is a full-stack platform designed to crawl, structure, and visualize data from the official Indian Parliament portal ([sansad.in](https://sansad.in)) and the Election Commission of India (ECI) affidavit portal.

## 🚀 Features

- **Deep Member Profiles**: Exhaustive biographical, political, and contact data for all 543 Lok Sabha members.
- **ECI Candidate Scraper**: (New) Scrapes candidate affidavits and profile metadata from the ECI portal.
- **Form 26 OCR Parser**: (New) Advanced PDF parsing using Tesseract.js and Poppler (`pdftoppm`) to extract structured financial and legal data from scanned candidate affidavits.
- **Local Image Storage**: Downloads and stores profile photos as **Base64** strings in SQLite, eliminating external fetches and privacy/CORS concerns.
- **Premium UI/UX**: Modern typography, glassmorphism, and smooth animations.
- **Isolated Stack**: Fully containerized using Docker Compose for a zero-pollution host environment.

## 🛠️ Technology Stack

- **Backend**: Node.js, Express, SQLite3
- **Frontend**: React (TypeScript), Vite, Vanilla CSS
- **OCR/Automation**: Puppeteer (Stealth), Tesseract.js, Poppler
- **Orchestration**: Docker, Docker Compose

## 🚦 Getting Started

### 1. Prerequisites
- [Docker](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/install/)

### 2. Build and Start
Run the following command to build and launch the services:

```bash
docker-compose up --build -d
```

### 3. Sync Data
Run the scrapers inside the container to populate your local database:

```bash
# For Sansad (MPs)
docker exec -it netamap-backend node src/scrapers/sansad_scraper.js

# For ECI (Candidates)
docker exec -it netamap-backend node src/scrapers/eci_scraper.js
```

### 4. Access
Visit **[http://localhost:5173](http://localhost:5173)** on your host.

## 📂 Project Structure

- `src/scrapers/eci_scraper.js`: ECI candidate scrape and Form 26 PDF parser.
- `src/scrapers/sansad_scraper.js`: Sansad data sync logic.
- `src/api/server.js`: Express API backend.
- `src/db/`: Database connection and initialization.
- `schemas.md`: Consolidated data schemas for all extraction targets.
- `ECI_SCRAPER.md`: Detailed documentation for the ECI tool.

---
*Note: This project is intended for educational and research purposes. Please respect the robots.txt and rate limits of the source portals.*
