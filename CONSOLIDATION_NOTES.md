# Consolidation Notes

This release consolidates the four supplied repositories into one deployable APAR / ACR application.

## Selected application base

`aparnextgen` on the `fix/vercel-deployment-and-hardening` branch is the source of truth. It contains the most complete implementation: employee and authority roles, approval-aware registration, APAR submission and review, employee directory management, notifications/reminders, PostgreSQL schema and reference data, production configuration, health check, automated tests, CI, Docker and Vercel frontend configuration.

## How the other repositories were used

- `apar-simpler`: an earlier reduced version of the same full-stack APAR workflow. Its core functionality is superseded by the hardened `aparnextgen` implementation; duplicating its older controllers/pages would create competing APIs and UI routes.
- `apar-simple`: an older, report-focused implementation with a different backend entity/API model. Its report routes and DTOs are not drop-in compatible with the NIC-style ACR schema used by the selected application, so the older implementation was not copied over the current backend.
- `aparform`: a standalone maroon-coloured form prototype. Its visual direction (maroon `#7B1818` / dark maroon `#5C1212`, section headers, and editable targets/achievements rows) is consistent with the selected application. However, its submit handler only simulates a delay and logs data locally; it does not persist to the API. That mock submit flow was deliberately not shipped as a second live form. The integrated `frontend/src/pages/SubmitAcr.jsx` remains the real, reminder-gated, API-connected submission page.

## File hygiene

The release contains one frontend, one backend, one database setup, one root Vercel deployment configuration, the automated tests and the CI workflow. It excludes duplicate legacy frontends/backends, generated build output, dependency folders, local secrets, and fake/mock submission code.
