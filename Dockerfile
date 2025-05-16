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

# Set environment variable for API URL
ENV VITE_API_URL=http://113.161.121.177:30011/

# Build the application
RUN npm run build

# Use Nginx to serve the built application
FROM nginx:alpine

# Copy the build output from the previous stage
COPY --from=0 /app/dist /usr/share/nginx/html

# Copy custom nginx config to expose port 3009
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 30009
EXPOSE 30009

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]