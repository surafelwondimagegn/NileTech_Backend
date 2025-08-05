#!/bin/bash

echo "🚀 NileTech Project System Comprehensive Testing"
echo "================================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install axios if not already installed
echo "📦 Installing dependencies..."
npm install axios --save-dev

# Check if the server is running
echo "🔍 Checking if server is running..."
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Server is running on http://localhost:3000"
else
    echo "❌ Server is not running. Please start the server first:"
    echo "   npm run start:dev"
    exit 1
fi

echo ""
echo "🧪 Starting comprehensive tests..."
echo ""

# Run the test script
node test-project-system.js

echo ""
echo "✅ Testing completed!"
echo ""
echo "📊 Check the output above for test results."
echo ""
echo "🔗 You can also test individual endpoints using:"
echo "   - POST /projects/test/notification-system"
echo "   - POST /projects/test/alert-system"
echo "   - POST /projects/test/financial-system"
echo "   - POST /projects/test/invoice-proforma-system"
echo "   - POST /projects/test/budget-expense-system"
echo "   - POST /projects/test/time-tracking-system"
echo "   - POST /projects/test/milestone-system"
echo "   - POST /projects/test/comprehensive"
echo ""
echo "🎉 Happy testing!" 