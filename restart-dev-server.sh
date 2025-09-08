#!/bin/bash
echo "Stopping development server..."
pkill -f "next dev" 2>/dev/null
echo "Clearing Next.js cache..."
rm -rf .next
rm -rf node_modules/.cache
echo "Starting development server..."
npm run dev
