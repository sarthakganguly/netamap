FROM node:20-bookworm-slim

# Install system dependencies for compiling native modules
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./

# Force rebuild of sqlite3 from source in this environment
RUN npm install --build-from-source --silent

# Copy application code
COPY . .

# Run the server
CMD ["node", "server.js"]
