#!/bin/bash

# ForwardsFlow Setup Script
# Run this script to set up the project in your GitHub repository

set -e

echo "🚀 ForwardsFlow Setup Script"
echo "================================"
echo ""

# Check prerequisites
check_prerequisites() {
    echo "Checking prerequisites..."
    
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js is not installed. Please install Node.js 18+"
        exit 1
    fi
    echo "✅ Node.js $(node --version)"
    
    if ! command -v npm &> /dev/null; then
        echo "❌ npm is not installed"
        exit 1
    fi
    echo "✅ npm $(npm --version)"
    
    if ! command -v git &> /dev/null; then
        echo "❌ Git is not installed"
        exit 1
    fi
    echo "✅ Git $(git --version)"
    
    echo ""
}

# Install dependencies
install_deps() {
    echo "Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
    echo ""
}

# Initialize Git (if not already)
init_git() {
    if [ ! -d ".git" ]; then
        echo "Initializing Git repository..."
        git init
        git add .
        git commit -m "Initial ForwardsFlow commit"
        echo "✅ Git repository initialized"
    else
        echo "✅ Git repository already exists"
    fi
    echo ""
}

# Setup Amplify (interactive)
setup_amplify() {
    echo "Do you want to initialize AWS Amplify? (y/n)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        if ! command -v amplify &> /dev/null; then
            echo "Installing Amplify CLI..."
            npm install -g @aws-amplify/cli
        fi
        
        echo ""
        echo "Running 'amplify init'..."
        echo "Follow the prompts to configure your Amplify project."
        echo ""
        amplify init
        
        echo ""
        echo "Adding authentication..."
        amplify add auth
        
        echo ""
        echo "Adding API..."
        amplify add api
        
        echo ""
        echo "Pushing to cloud..."
        amplify push
        
        echo "✅ Amplify setup complete"
    else
        echo "Skipping Amplify setup. Run 'amplify init' later to configure."
    fi
    echo ""
}

# Push to GitHub
push_to_github() {
    echo "Do you want to push to GitHub? (y/n)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        echo "Enter your GitHub repository URL:"
        read -r repo_url
        
        git remote add origin "$repo_url" 2>/dev/null || git remote set-url origin "$repo_url"
        git branch -M main
        git push -u origin main
        
        echo "✅ Pushed to GitHub"
    fi
    echo ""
}

# Main execution
main() {
    check_prerequisites
    install_deps
    init_git
    setup_amplify
    push_to_github
    
    echo "================================"
    echo "🎉 Setup complete!"
    echo ""
    echo "Next steps:"
    echo "1. Run 'npm start' to start the development server"
    echo "2. Open http://localhost:3000 in your browser"
    echo "3. Use demo credentials to explore the application"
    echo ""
    echo "Demo Credentials:"
    echo "  Super Admin: admin@forwardsflow.com / admin123"
    echo "  Bank Admin:  admin@equityafrica.com / demo123"
    echo "  Investor:    admin@impactcapital.com / demo123"
    echo ""
}

main
