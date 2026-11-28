# Changelog

All notable changes to this project are documented in this file. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Removed

- **Breaking.** `organization.clerkOrgId` and its index. Entrolytics dropped the
  `organization.clerk_org_id` column when sign-in moved from Clerk to the dashboard itself, so a
  query that selected it fails against a current database.

## [3.0.3] - 2026-11-26

### Changed

- Built and released with pnpm 12.24.0. No code changes.

[Unreleased]: https://github.com/entrolytics/drizzle-client/compare/v3.0.3...HEAD
[3.0.3]: https://github.com/entrolytics/drizzle-client/releases/tag/v3.0.3
