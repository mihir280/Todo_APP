# Node Base Image
FROM node:18-alpine as build

# Working Directory
WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy the rest of the code
COPY . .

# Production image
FROM node:18-alpine

# Create app directory
WORKDIR /app

# Install production dependencies only
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package*.json ./

# Copy application code
COPY --from=build /app/app.js ./
COPY --from=build /app/views ./views
COPY --from=build /app/public ./public

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8000

# Expose the port
EXPOSE 8000

# Set user for better security
USER node

# Run the application
CMD ["node", "app.js"]
