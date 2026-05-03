#!/bin/bash
set -e

# Ensure we are in the root directory
cd "$(dirname "$0")/.."

# Extract version from package.json and commit hash
VERSION=$(node -p "require('./package.json').version")
COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")

echo "Preparing to build book version $VERSION (commit $COMMIT)..."

# Inject version and commit hash into index.md
# We'll look for the main header and append it there.
sed -i.bak "s/# Book Title:.*/&\n\n**Version:** $VERSION (Commit: \`$COMMIT\`)/" book/src/index.md
rm -f book/src/index.md.bak

echo "Building mdbook..."
cd book
mdbook build

# If PDF was generated, copy it to the html directory so it gets deployed to GitHub Pages
if [ -f "book/pdf/output.pdf" ]; then
    cp "book/pdf/output.pdf" "book/html/book.pdf"
    echo "Copied PDF to book/html/book.pdf"
fi

echo "Book build complete!"
