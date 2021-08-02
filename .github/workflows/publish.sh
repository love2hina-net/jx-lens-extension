#!/usr/bin/env sh

echo "committing the new version number"
remote_repo="https://${GITHUB_ACTOR}:${GITHUB_TOKEN}@github.com/${GITHUB_REPOSITORY}.git"
git config http.sslVerify false
git config user.name "Merge Release"
git config user.email "actions@users.noreply.github.com"
git remote add merge-release "${remote_repo}"
git remote --verbose
git show-ref # useful for debugging
git branch --verbose

git commit -a -m "chore: upgrade version"
git push
