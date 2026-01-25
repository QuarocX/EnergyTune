#!/usr/bin/env bash
set -euo pipefail

SOURCE_BRANCH="main"
TARGET_BRANCH="dev"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Not inside a git repository."
  exit 1
fi

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

if [ "${CURRENT_BRANCH}" != "${SOURCE_BRANCH}" ]; then
  echo "Please run this script from '${SOURCE_BRANCH}'. Current: ${CURRENT_BRANCH}"
  exit 1
fi

git fetch origin ${SOURCE_BRANCH} ${TARGET_BRANCH}
git checkout ${TARGET_BRANCH}
git merge --no-ff ${SOURCE_BRANCH} -m "chore(backmerge): merge ${SOURCE_BRANCH} into ${TARGET_BRANCH}"
git push origin ${TARGET_BRANCH}
git checkout ${SOURCE_BRANCH}
