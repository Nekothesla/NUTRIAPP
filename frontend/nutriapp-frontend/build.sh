#!/bin/bash
set -e

# Inject the backend API URL into the production environment file.
# API_URL is set as an environment variable in Render.
API_URL="${API_URL:-http://localhost:8000}"
sed -i "s|__API_URL__|${API_URL}|g" src/environments/environment.prod.ts

npm install
npm run build -- --configuration production