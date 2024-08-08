# Use the official Node.js image as the base image
FROM node:18 AS build

# Set the working directory in the container
WORKDIR /usr/src/frontend

# Copy the application data
COPY . .

# Install dependencies
RUN npm install

# Build the React application
RUN npm run build

# Use Nginx to serve the React application
FROM nginx:alpine

# Copy the build files from the previous stage
COPY --from=build /usr/src/frontend/build /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
