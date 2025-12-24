#!/bin/bash

# Portfolio Page Toggle Script
# Usage: ./toggle-site.sh [construction|portfolio]

if [ "$1" = "portfolio" ]; then
    if [ -f "portfolio.html" ]; then
        mv index.html construction.html
        mv portfolio.html index.html
        echo "✅ Switched to PORTFOLIO mode"
        echo "🌐 Your portfolio is now live at index.html"
    else
        echo "❌ portfolio.html not found!"
    fi
elif [ "$1" = "construction" ]; then
    if [ -f "construction.html" ]; then
        mv index.html portfolio.html
        mv construction.html index.html
        echo "🚧 Switched to CONSTRUCTION mode"
        echo "⏳ Under construction page is now live at index.html"
    else
        echo "❌ construction.html not found!"
    fi
else
    echo "🔄 Portfolio Site Toggle"
    echo "Usage: ./toggle-site.sh [construction|portfolio]"
    echo ""
    if [ -f "portfolio.html" ]; then
        echo "📊 Current mode: CONSTRUCTION"
        echo "💡 Run: ./toggle-site.sh portfolio (to show portfolio)"
    else
        echo "📊 Current mode: PORTFOLIO"
        echo "💡 Run: ./toggle-site.sh construction (to show under construction)"
    fi
fi