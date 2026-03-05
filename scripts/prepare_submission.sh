#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   bash scripts/prepare_submission.sh GroupName_SubjectCode_Frontend_Code.zip
#
# Produces a zip excluding node_modules, build, .git and OS cruft.

ZIP_NAME="${1:-Group_SubjectCode_Frontend_Code.zip}"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "Creating $ZIP_NAME from $(pwd)"

zip -r "$ZIP_NAME" \
  public src package.json package-lock.json README.md \
  -x "node_modules/*" "build/*" ".git/*" ".DS_Store" \
     "public/*.map" "src/**/*.map" \
     "scripts/prepare_submission.sh~" \
     "npm-debug.log" "yarn-error.log"

echo "Done. Output: $ZIP_NAME"
