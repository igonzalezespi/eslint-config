#!/usr/bin/env bash
# bootstrap.sh — one-time / re-runnable setup for a fresh clone or worktree.
#
# 1. Installs the plugins this repo declares in .claude/settings.json from the
#    maintainer's plugin marketplace (project scope).
# 2. Enables the local git hooks (private-reference pre-commit guard).
# 3. If the core-dev plugin is installed, refreshes the vendored guard from the
#    canonical core (guard-sync) and verifies it (guard-verify). The guard
#    ENFORCES from its committed copy in scripts/hooks/ regardless; this only
#    keeps that copy current and proves it is intact, cabled and live.
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT"

# --- 1. Declared plugins (project scope) ------------------------------------
# Kept in lockstep with .claude/settings.json enabledPlugins. The marketplace is
# added first (idempotent) so the @ivan plugins resolve.
if command -v claude >/dev/null 2>&1; then
  claude plugin marketplace add igonzalezespi/claude-plugins 2>/dev/null || true
  for p in core-dev stack-node studio-policy; do
    claude plugin install "${p}@ivan" --scope project || \
      echo "bootstrap: could not install ${p}@ivan (continuing)" >&2
  done
else
  echo "bootstrap: 'claude' CLI not found — skipping plugin install (install the CLI, then re-run)." >&2
fi

# --- 2. Local git hooks (private-reference pre-commit guard) -----------------
git config core.hooksPath .githooks
echo "bootstrap: git hooks enabled (core.hooksPath=.githooks)"

# --- 3. Refresh + verify the vendored guard (if core-dev is installed) -------
SYNC=""
VERIFY=""
for base in \
  "${CLAUDE_PLUGIN_ROOT:-}" \
  "$HOME/.claude/plugins/cache/ivan/core-dev"; do
  [ -n "$base" ] || continue
  [ -z "$SYNC" ] && [ -x "$base/scripts/guard-sync.sh" ] && SYNC="$base/scripts/guard-sync.sh"
  [ -z "$VERIFY" ] && [ -x "$base/scripts/guard-verify.sh" ] && VERIFY="$base/scripts/guard-verify.sh"
done

if [ -n "$SYNC" ]; then
  "$SYNC" --repo "$ROOT"
else
  echo "bootstrap: core-dev/guard-sync not found (plugin not installed) — the vendored guard in scripts/hooks/ still enforces; run /guard-sync after installing core-dev to refresh it." >&2
fi

if [ -n "$VERIFY" ]; then
  "$VERIFY" --repo "$ROOT"
else
  echo "bootstrap: core-dev/guard-verify not found — running the vendored self-test instead." >&2
  bash scripts/hooks/bash-guard.test.sh
fi

echo "bootstrap: done."
