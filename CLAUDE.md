# eslint-config

Shared, published **ESLint flat configs** for the maintainer's repos: `base.mjs`, `expo.mjs`,
`next.mjs`. Public (MIT). Consumed as an npm dependency, so the exported configs are a public
API — a rule change affects every consumer's lint.

## Rules

- **Public repo — never name a private project.** Not in configs, tests, docs, comments,
  commit messages, or CI. A local `pre-commit` guard (`.githooks/pre-commit`) enforces this
  against a private denylist; enable it per clone with `git config core.hooksPath .githooks`
  (it is a no-op where the denylist is absent, e.g. a fork). Not wired via a package `prepare`
  script on purpose — that would run in consumers' installs.
- **English only** — code, docs, comments, commits.
- **Conventional Commits** — `type(scope): description` (`feat/fix/chore/docs/ci`).
- **Branch flow: trunk → main.** PRs target `main`; keep them linear (rebase-and-merge). The
  only sanctioned force-push is `--force-with-lease` on your own PR branch.
- **No secrets committed** — placeholders only.
- **Tests are the contract.** `__tests__/` (vitest) pins the exported rules; run them before
  committing. A rule add/removal is a breaking change for consumers — prefer additive/opt-in.
