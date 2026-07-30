# `@om/workshop-sdk`

Host transport SDK for OM Workshop modules.

- Accepts a host base URL or injected `fetch` transport
- Defaults to authenticated same-origin credentials
- Returns `@om/workshop-contracts` DTOs only
- Preserves and emits correlation IDs
- Exposes capability discovery helpers
- Never connects to MariaDB/SQLite or privileged host paths
