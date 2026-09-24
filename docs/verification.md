# Verification

Use Node 24 and `npm ci` for the same dependency tree as CI.

- `npm run verify`: type checks, lint, formatting checks, all unit tests, production build.
- `npm run format`: format source files (Biome for JS/TS/JSON/CSS; Prettier for Astro/Markdown/YAML).
- `npm run lint:fix`: apply safe lint fixes.
- `npm test`: music and palette tests using Node's built-in test runner.

Checks never modify files. The pre-commit hook formats and checks staged files;
GitHub Actions runs full verification for every PR and main push. The required
branch-protection check should be `verify` from the Verify workflow.

Keep generated assets and build output out of formatting. Add regression tests
with behavior changes. New UI flows should also get browser-level tests; unit
tests alone cannot validate interaction or layout.
