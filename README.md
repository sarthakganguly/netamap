# NetaMap - Sansad Scraper

NetaMap is a specialized tool designed to crawl, scrape, and structure data from the official Indian Parliament portal ([sansad.in](https://sansad.in)). It extracts comprehensive biographical, political, and contact information for Lok Sabha members and stores it in a self-contained SQLite database.

## 🚀 Features

- **Deep Member Profiles**: Extracts 50+ data points for all 543 Lok Sabha members (Bio, Education, Profession, Contact, etc.).
- **Image Extraction**: Automatically downloads and stores member profile photos as **Base64** strings directly in the database.
- **Party Representation**: Syncs current seat counts for all political parties in the 18th Lok Sabha.
- **Parliamentary Glossary**: Extracts and structures the official glossary of parliamentary terms.
- **Dockerized Environment**: Fully isolated execution environment to ensure host system integrity.
- **Gemini CLI Skill**: Includes a specialized agent skill (`sansad-scraper-skill`) for programmatic understanding of the data schema and API.

## 🛠️ Technology Stack

- **Runtime**: Node.js 20
- **Database**: SQLite3
- **Containerization**: Docker & Docker Compose
- **Agent Skill**: Gemini CLI Skill Framework

## 📋 Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## 🚦 Getting Started

### 1. Build and Run the Scraper
Run the full sync to fetch all data and populate the local database:

```bash
docker-compose up --build
```

This will:
1. Initialize the `sansad.db` SQLite database.
2. Fetch the aggregate party statistics.
3. Fetch the full glossary of parliamentary terms.
4. Iterate through all 540+ members, fetching their full profiles and images.

### 2. Access the Data
The data is stored in `sansad.db` in the root directory. You can query it using any SQLite client or via Docker:

```bash
# Example: Query a member profile via Docker
docker run --rm -v $(pwd):/app -w /app node:20-bookworm-slim node -e "const sqlite3 = require('sqlite3'); const db = new sqlite3.Database('sansad.db'); db.get('SELECT fullName, constituency, partySname FROM members LIMIT 1', (err, row) => console.log(row));"
```

## 📂 Project Structure

- `sansad-scraper-skill/`: Local Gemini CLI skill containing schemas and procedural logic.
- `scraper.js`: Main application logic for API traversal and data normalization.
- `database.js`: SQLite schema definition and initialization.
- `sansad.db`: The generated SQLite database (created after first run).
- `Dockerfile` & `docker-compose.yml`: Isolation and deployment configuration.

## 📊 Data Schema Highlights

- **Member Table**: `mpsno`, `fullName`, `gender`, `partyFname`, `constituency`, `stateName`, `dob`, `education`, `image` (Base64), `pan_number` (Custom Field), etc.
- **Parties Table**: `partyFname`, `partySname`, `count`.
- **Terms Table**: `title`, `description`, `letter`.

---
*Note: This project is intended for educational and research purposes. Please respect the robots.txt and rate limits of the source portal.*
