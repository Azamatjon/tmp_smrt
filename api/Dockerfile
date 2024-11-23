### Dockerfile for Express.js Application

# Use a Debian-based Node.js image for better compatibility
FROM node:16-bullseye

# Set the working directory in the container
WORKDIR /usr/src/app

COPY package.json .

# Install the dependencies
RUN npm install --production

# Copy the rest of the application files
COPY . .

# Expose the application port
EXPOSE 4000

ENV NODE_ENV=production

# Start the application
CMD ["node", "index.js"]
