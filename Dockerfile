# Node Base Image
FROM node:18-alpine

# Working Directory
WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the code
COPY . .

# Run tests
RUN npm run test

# Expose the port
EXPOSE 8000

# Set user for better security
USER node

# Run the application
CMD ["node", "app.js"]
