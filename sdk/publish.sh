#!/bin/bash

# sBTC Gateway SDK Publishing Script
# This script publishes both Node.js and Python SDKs

set -e

echo "🚀 Publishing sBTC Gateway SDKs..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -d "sdk" ]; then
    echo -e "${RED}❌ Error: Please run this script from the project root directory${NC}"
    exit 1
fi

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check dependencies
echo -e "${BLUE}🔍 Checking dependencies...${NC}"

if ! command_exists node; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi

if ! command_exists npm; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

if ! command_exists python3; then
    echo -e "${RED}❌ Python 3 is not installed${NC}"
    exit 1
fi

if ! command_exists pip; then
    echo -e "${RED}❌ pip is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All dependencies found${NC}"

# Publish Node.js SDK
echo -e "\n${BLUE}📦 Publishing Node.js SDK...${NC}"
cd sdk/node

# Install dependencies
echo -e "${YELLOW}Installing Node.js dependencies...${NC}"
npm install

# Run tests
echo -e "${YELLOW}Running Node.js tests...${NC}"
npm test

# Build the package
echo -e "${YELLOW}Building Node.js package...${NC}"
npm run build

# Check if already logged in to npm
if ! npm whoami > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Please login to npm first:${NC}"
    echo "npm login"
    exit 1
fi

# Publish to npm
echo -e "${YELLOW}Publishing to npm...${NC}"
npm publish --access public

echo -e "${GREEN}✅ Node.js SDK published successfully${NC}"

cd ../..

# Publish Python SDK
echo -e "\n${BLUE}📦 Publishing Python SDK...${NC}"
cd sdk/python

# Install build dependencies
echo -e "${YELLOW}Installing Python build dependencies...${NC}"
pip install build twine

# Build the package
echo -e "${YELLOW}Building Python package...${NC}"
python -m build

# Check if already configured for PyPI
if [ ! -f ~/.pypirc ]; then
    echo -e "${YELLOW}⚠️  Please configure PyPI credentials first:${NC}"
    echo "Create ~/.pypirc with your PyPI credentials"
    echo "Or run: python -m twine configure"
    exit 1
fi

# Upload to PyPI
echo -e "${YELLOW}Publishing to PyPI...${NC}"
python -m twine upload dist/*

echo -e "${GREEN}✅ Python SDK published successfully${NC}"

cd ../..

echo -e "\n${GREEN}🎉 All SDKs published successfully!${NC}"
echo -e "\n${BLUE}📋 Installation commands:${NC}"
echo -e "${YELLOW}Node.js:${NC} npm install @sbtc-gateway/node"
echo -e "${YELLOW}Python:${NC} pip install sbtc-gateway"

echo -e "\n${BLUE}📚 Next steps:${NC}"
echo "1. Update documentation with new version numbers"
echo "2. Create GitHub release with changelog"
echo "3. Update examples and integration guides"
echo "4. Notify users about the new release"
