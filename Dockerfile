### Dockerfile to generate a image that builds the application
### (i.e. generates the "public" folder)
### Whether it is for a production or development environment should
### be specified via the MODE environment variable

FROM node

WORKDIR /app

# Copy all configuration and source files ignoring files and
# folders specified .dockerignore like node_modules
COPY . /app

# Install the dependencies and build the application folder
RUN npm install && npm run build