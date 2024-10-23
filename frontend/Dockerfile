# Use the official Node.js runtime as the base image
FROM node

# Set the working directory in the container
WORKDIR /QDP

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire application code to the working directory
COPY . .

# Build the React app for production
RUN npm run build

# Install serve to serve the React app
RUN npm install -g serve

# Expose the port the app will run on
EXPOSE 8080

# Command to run the application
CMD ["serve", "-s", "build", "-l", "3000"]
