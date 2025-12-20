    #!/usr/bin/env bash

    set -euo pipefail

    echo "🔧 Running pre-install checks..."

    # Log environment info
    echo "📋 Environment Info:"
    echo "Node version: $(node --version)"
    echo "NPM version: $(npm --version)"
    echo "Working directory: $(pwd)"

    # Verify we have package.json
    if [ ! -f "package.json" ]; then
        echo "❌ ERROR: package.json not found"
        exit 1
    fi

    echo "✅ Pre-install checks passed"