# H02 — om-packages note

H02 governance/review-queue hardening is implemented on the **om-workshop host**
(`WorkshopGovernanceService.mjs`, Review Queue UI). `@om/*` packages do not
connect to MariaDB and do not own approval decisions.

This branch documents that no package source change was required for H02.
Integration coverage lives in the host two-actor scratch proof and integrity SQL.
