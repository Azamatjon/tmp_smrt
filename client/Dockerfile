# Stage 1: Build the React application
FROM node:8.12.0-alpine AS build

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json ./

# Install the dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Build-time variables
ARG REACT_APP_API
ARG REACT_APP_WEBSOCKET

# Set environment variables for the build process
ENV REACT_APP_API=$REACT_APP_API
ENV REACT_APP_WEBSOCKET=$REACT_APP_WEBSOCKET

# Build the application
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*


# Copy the build files to Nginx's html directory
COPY --from=build /app/build /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose the default Nginx port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
