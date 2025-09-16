#!/bin/bash
echo "📊 Daily Progress Report - $(date)"
echo "=================================="
echo "🧪 Tests:"
npm test -- --coverage --watchAll=false --passWithNoTests | tail -5
echo ""
echo "🏗️ Build:"
npm run build 2>&1 | tail -3
echo ""
echo "📦 Bundle size:"
du -sh .next/ 2>/dev/null || echo "No build yet"
echo ""
echo "🎯 TODOs remaining:"
grep -r "TODO\|FIXME" src/ | wc -l || echo "0"
echo "=================================="