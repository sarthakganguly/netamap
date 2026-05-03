FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm install --silent

COPY . .

EXPOSE 5173

# Run vite dev server with --host to allow access from host machine
CMD ["npm", "run", "dev", "--", "--host"]
