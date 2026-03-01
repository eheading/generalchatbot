#!/bin/bash
# Usage: GITHUB_TOKEN=ghp_xxx bash push-to-github.sh

GITHUB_USERNAME="eheading"
REPO_NAME="generalchatbot"
TOKEN="${GITHUB_TOKEN:?Please set GITHUB_TOKEN=ghp_xxx}"

# Verify token and show user/scopes
echo "Verifying token..."
SCOPES=$(curl -sI https://api.github.com/user -H "Authorization: token $TOKEN" | grep -i "x-oauth-scopes" | tr -d '\r')
LOGIN=$(curl -s https://api.github.com/user -H "Authorization: token $TOKEN" | python3 -c "import json,sys; print(json.load(sys.stdin).get('login','unknown'))")
echo "Authenticated as: $LOGIN"
echo "Token scopes: $SCOPES"

if ! echo "$SCOPES" | grep -q "repo"; then
  echo ""
  echo "ERROR: Token is missing 'repo' scope."
  echo "Create a new classic PAT at: https://github.com/settings/tokens/new"
  echo "Check the 'repo' checkbox, then re-run with the new token."
  exit 1
fi

echo ""
echo "Creating repo: $GITHUB_USERNAME/$REPO_NAME ..."
RESULT=$(curl -s -X POST https://api.github.com/user/repos \
  -H "Authorization: token $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"$REPO_NAME\",\"private\":false,\"description\":\"Company AI Chatbot — OpenRouter + Next.js\"}")

HTML_URL=$(echo "$RESULT" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('html_url',''))" 2>/dev/null)
if [ -n "$HTML_URL" ]; then
  echo "Repo created: $HTML_URL"
else
  echo "$RESULT" | python3 -c "import json,sys; d=json.load(sys.stdin); print('Error:', d.get('message','unknown'))"
  exit 1
fi

echo ""
echo "Pushing to master..."
git remote add origin "https://$TOKEN@github.com/$GITHUB_USERNAME/$REPO_NAME.git" 2>/dev/null || \
  git remote set-url origin "https://$TOKEN@github.com/$GITHUB_USERNAME/$REPO_NAME.git"

git push -u origin master

echo ""
echo "Done! Visit: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
