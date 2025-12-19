#!/bin/bash
set -e
echo "========================================="
echo "Running post-install patch script..."
echo "========================================="
node patch-expo.js
echo "Post-install complete!"
