FROM node:20-bookworm-slim

# Install system dependencies for Puppeteer and native modules
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    wget \
    gnupg \
    ca-certificates \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    fonts-liberation \
    xdg-utils \
    libpango-1.0-0 \
    libcairo2 \
    libpangocairo-1.0-0 \
    libatk1.0-0 \
    libgtk-3-0 \
    poppler-utils \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./

# Force rebuild of sqlite3 from source in this environment
RUN npm install --build-from-source --silent

# Copy application code
COPY . .

# Run the server
CMD ["node", "src/api/server.js"]
