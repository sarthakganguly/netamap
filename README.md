# NetaMap - Sansad Scraper & Search

NetaMap is a full-stack, mobile-responsive application designed to crawl, structure, and visualize data from the official Indian Parliament portal ([sansad.in](https://sansad.in)). It provides a premium search experience with local data persistence.

## 🚀 Features

- **Deep Member Profiles**: Exhaustive biographical, political, and contact data for all 543 Lok Sabha members.
- **Local Image Storage**: Downloads and stores profile photos as **Base64** strings in SQLite, eliminating external fetches and privacy/CORS concerns.
- **Premium UI/UX**: Modern "Plus Jakarta Sans" typography, glassmorphism, and smooth animations.
- **Dual Themes**: Toggle between a sophisticated Light Mode and a deep Charcoal/Indigo Dark Mode.
- **Isolated Stack**: Fully containerized using Docker Compose for a zero-pollution host environment.
- **Real-Time Search**: High-performance, debounced search by name or constituency.

## 🛠️ Technology Stack

- **Backend**: Node.js, Express, SQLite3
- **Frontend**: React (TypeScript), Vite, Vanilla CSS
- **Orchestration**: Docker, Docker Compose

## 🚦 Getting Started

### 1. Prerequisites
- [Docker](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/install/)

### 2. Configuration
Create a `.env` file in the `frontend/` directory to point to your server's IP:

```bash
# frontend/.env
VITE_API_URL=http://<YOUR_SERVER_IP>:5000
```

### 3. Build and Start
Run the following command to build and launch the services:

```bash
docker-compose up --build -d
```

### 4. Sync Data
The scraper must be run once inside the container to populate your local database:

```bash
docker-compose exec backend node scraper.js
```

### 5. Access
Visit **[http://localhost:5173](http://localhost:5173)** on your host or **[http://<YOUR_SERVER_IP>:5173](http://<YOUR_SERVER_IP>:5173)** from your mobile device.

## 📂 Project Structure

- `sansad-scraper-skill/`: Agent skill for data extraction logic.
- `frontend/`: React search application.
- `server.js`: Express API backend.
- `scraper.js`: Data sync and image encoding logic.
- `database.js`: SQLite schema initialization.
- `sansad.db`: Self-contained SQLite database.

## 📊 Data Schema Highlights

- **Member Table**: Includes `fullName`, `constituency`, `partySname`, `image` (Base64), `education`, `email`, `permanentAddress`, and a custom `pan_number` field.

---
*Note: This project is intended for educational and research purposes. Please respect the robots.txt and rate limits of the source portal.*
