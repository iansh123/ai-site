FROM node:20

# Set working directory
WORKDIR /app

# Copy everything and install
COPY . .

# Install dependencies
RUN npm install

# Expose Vite dev server port
EXPOSE 5173

