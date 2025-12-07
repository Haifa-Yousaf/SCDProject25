# Use official Node.js LTS image
FROM node:18

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the source code
COPY . .

# Expose the port your app listens on
EXPOSE 4000

# Start the app
CMD ["node", "main.js"]
