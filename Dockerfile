# Use Node.js as the base image
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Set environment variable for API URL (updated to match backend port)
ENV VITE_API_URL=https://api-a68.vqtoan1807.me/

# Build the application
RUN npm run build

# Use Nginx to serve the built application
FROM nginx:alpine

# Copy the build output from the previous stage
COPY --from=0 /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 (nginx default)
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]