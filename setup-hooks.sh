#!/bin/sh

# Simple script to set up git hooks
HOOK_DIR=".git/hooks"

if [ ! -d ".git" ]; then
  echo "Not a git repository"
  exit 0
fi

echo "Setting up git hooks..."

# Create pre-commit hook
cat > "$HOOK_DIR/pre-commit" << 'EOF'
#!/bin/sh
npx lint-staged
EOF

# Create pre-push hook
cat > "$HOOK_DIR/pre-push" << 'EOF'
#!/bin/sh
npm run type-check
EOF

# Make hooks executable
chmod +x "$HOOK_DIR/pre-commit"
chmod +x "$HOOK_DIR/pre-push"

echo "Git hooks installed successfully!"
