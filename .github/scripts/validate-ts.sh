#!/bin/bash
# PostToolUse validation hook for klp-builder agent.
# Reads tool use event from stdin; if a TS/TSX file was written, runs tsc --noEmit.
# Exit 0 = OK, exit 2 = blocking error (tsc failed).

set -euo pipefail

INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('tool_name',''))" 2>/dev/null || echo "")
FILE_PATH=$(echo "$INPUT" | python3 -c "import sys,json; d=json.load(sys.stdin); inp=d.get('tool_input',{}); print(inp.get('path', inp.get('target_file','')))" 2>/dev/null || echo "")

# Only validate after file write tools
if [[ "$TOOL_NAME" != "create_file" && "$TOOL_NAME" != "edit_file" && "$TOOL_NAME" != "str_replace_editor" ]]; then
  exit 0
fi

# Only validate TypeScript/TSX files
if [[ "$FILE_PATH" != *.ts && "$FILE_PATH" != *.tsx ]]; then
  exit 0
fi

# Only run if tsconfig exists (project scaffolded)
if [ ! -f "tsconfig.json" ]; then
  exit 0
fi

echo "🔍 Running tsc --noEmit after editing $FILE_PATH..."
OUTPUT=$(npx tsc --noEmit 2>&1 | head -30 || true)

if echo "$OUTPUT" | grep -q "error TS"; then
  echo "❌ TypeScript errors found:"
  echo "$OUTPUT"
  # Return a systemMessage so the agent sees it and fixes errors before continuing
  python3 -c "
import json, sys
msg = '''TypeScript compilation errors detected after writing $FILE_PATH. Fix these before proceeding to the next phase:

''' + sys.argv[1]
print(json.dumps({'systemMessage': msg}))
" "$OUTPUT"
  exit 2
fi

echo "✅ tsc --noEmit passed"
exit 0
