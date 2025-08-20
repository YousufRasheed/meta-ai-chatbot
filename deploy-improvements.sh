#!/bin/bash

# Database Improvements Deployment Script
# Run this script to deploy the database improvements

set -e  # Exit on any error

echo "🚀 Deploying Database Improvements for Meta AI Chatbot"
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root directory."
    exit 1
fi

# Check if Prisma is installed
if ! command -v npx &> /dev/null; then
    echo "❌ Error: npx not found. Please install Node.js and npm."
    exit 1
fi

echo "✅ Pre-flight checks passed"

# Step 1: Install dependencies
echo "📦 Installing dependencies..."
npm install

# Step 2: Run database migration
echo "🗄️  Running database migration..."
echo "This will add the new fields and indexes to your database."
read -p "Continue? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npx prisma migrate dev --name add_processing_fields_and_indexes
else
    echo "❌ Migration cancelled. Please run 'npx prisma migrate dev' manually when ready."
    exit 1
fi

# Step 3: Generate Prisma client
echo "🔧 Generating updated Prisma client..."
npx prisma generate

# Step 4: Check environment variables
echo "🔍 Checking environment variables..."
if [ ! -f ".env" ] && [ ! -f ".env.local" ]; then
    echo "⚠️  Warning: No .env file found. Please make sure to add CLEANUP_API_KEY to your environment."
    echo "   You can copy .env.example to .env and fill in the values."
fi

# Step 5: Run linting
echo "🧹 Running linter..."
npm run lint

# Step 6: Build the project
echo "🏗️  Building the project..."
npm run build

# Step 7: Success message
echo ""
echo "🎉 Database improvements deployed successfully!"
echo ""
echo "Next steps:"
echo "1. Deploy your application to your hosting platform"
echo "2. Monitor the cleanup service logs"
echo "3. Test message processing under load"
echo ""
echo "For more information, see DATABASE_IMPROVEMENTS.md"
echo ""
echo "To manually clean up stale locks, you can call:"
echo "  POST /api/cleanup"
echo "  Authorization: Bearer <CLEANUP_API_KEY>"
echo ""
echo "Happy coding! 🚀"