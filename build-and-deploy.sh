#!/bin/bash

# Build and Deploy Script for A68 Frontend
# This script builds the Docker image and deploys it using Docker Stack

set -e  # Exit on any error

# Configuration
IMAGE_NAME="a68-frontend"
STACK_NAME="a68-frontend"
COMPOSE_FILE="docker-compose.stack.yml"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the correct directory
if [ ! -f "Dockerfile" ] || [ ! -f "$COMPOSE_FILE" ]; then
    print_error "Dockerfile or $COMPOSE_FILE not found in current directory"
    print_error "Please run this script from the a68-fe directory"
    exit 1
fi

print_status "Starting build and deploy process for $IMAGE_NAME"

# Step 1: Build Docker image
print_status "Building Docker image: $IMAGE_NAME"
if docker build -t "$IMAGE_NAME" .; then
    print_status "Docker image built successfully"
else
    print_error "Failed to build Docker image"
    exit 1
fi

#Step 2: Remove existing stack if it exists
if docker stack ls | grep -q "$STACK_NAME"; then
    print_warning "Stack $STACK_NAME already exists. Removing it..."
    if docker stack rm "$STACK_NAME"; then
        print_status "Stack $STACK_NAME removed successfully"
    else
        print_error "Failed to remove stack $STACK_NAME"
        exit 1
    fi
fi

# Step 2: Deploy with Docker Stack
print_status "Deploying stack: $STACK_NAME"
if docker stack deploy -c "$COMPOSE_FILE" "$STACK_NAME"; then
    print_status "Stack deployed successfully"
else
    print_error "Failed to deploy stack"
    exit 1
fi

# Step 3: Show stack status
print_status "Checking stack status..."
docker stack ls | grep "$STACK_NAME" || print_warning "Stack not found in list"

print_status "Checking services status..."
docker stack services "$STACK_NAME" || print_warning "Unable to get service status"

print_status "Build and deploy completed successfully!"
print_status "You can check logs with: docker service logs -f ${STACK_NAME}_<service-name>"
