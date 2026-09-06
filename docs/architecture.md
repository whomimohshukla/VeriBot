# VeriBot Architecture Notes

## Service split

- web: user dashboard and control center
- api: business logic and auth APIs
- worker: queue-driven automation
- test-runner: Playwright execution environment
- database: Prisma and Postgres models

## Data flow

1. User signs in and creates an organization.
2. User creates a project and application URL.
3. The API stores app metadata and credentials.
4. Worker receives a crawl or test run job.
5. Test runner opens the site with Playwright.
6. Results are saved to Postgres and evidence is uploaded to object storage.
7. AI agent analyzes the output and may create bug records or fix suggestions.
