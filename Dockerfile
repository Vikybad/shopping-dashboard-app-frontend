# Use the official Node.js image as the base image
FROM node:22-alpine AS build

# Set the working directory in the container
WORKDIR /app

COPY package*.json ./
RUN npm ci
COPY . .

ARG VITE_API_URL=http://localhost:5000/api
ENV VITE_API_URL=$VITE_API_URL

# Build the React application
RUN npm run build

# Use Nginx to serve the React application
FROM nginx:alpine

# Copy the build files from the previous stage
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
