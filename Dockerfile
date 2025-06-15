# Build stage
FROM node:16 AS builder
WORKDIR /app
# Copy all files to ensure public and src are available
COPY . .
RUN npm ci
RUN npm run build

# Production stage
FROM node:16
WORKDIR /app
# Install serve globally
RUN npm install -g serve
# Copy the build folder from the builder stage
COPY --from=builder /app/build ./build
# Set the port environment variable
ENV PORT=8090
# Expose the port
EXPOSE $PORT
# Run serve to serve the build folder
CMD ["sh", "-c", "serve -s build -l $PORT"]
