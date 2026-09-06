# AutonomIQ Postman Auth Collection

Import `AutonomIQ-Auth.postman_collection.json` into Postman.

## Run order

1. Start PostgreSQL/Neon and Redis, then start the API on port `3001`.
2. Run `00 - Health`.
3. Run `01 - AuthN: register and login` in order. Postman stores the signed `autonomiq_session` cookie automatically.
4. Run the profile, API-key, credential, and organization folders.
5. Run `07 - Projects and applications` while logged in. It creates a project and application and stores the project ID automatically.
6. Use the session list/revoke requests, organization switch request, browser OAuth requests, and API-key test-run request as needed.
7. Run the organization delete and account delete requests only when you are finished with the test data.
8. Run `06 - Session end` last. The final request proves protected routes reject the logged-out session.

## Important variables

- `baseUrl`: defaults to `http://localhost:3001/api/v1`.
- `email` and `password`: used by registration and login.
- `orgId`, `userId`, `memberUserId`, and `apiKeyId`: populated by request tests.
- `verificationToken`, `resetToken`, `invitationToken`, and `totpCode`: require a value from the corresponding email/development flow before those requests can succeed.
- `verificationCode`: captured automatically from the development registration response. In production, the six-digit code is delivered by SMTP and is never included in the API response.
- `projectId`: set this to an existing project before creating a test credential.

The API uses HTTP-only signed cookies, so do not add a bearer token. Make sure Postman's cookie jar is enabled. The plaintext API key is saved only into the collection variable by the create request and is not returned by list requests.

Redis must be running for sessions and rate limiting. Auth requests use Redis-backed limits: 5/minute for registration, 10/minute for login, 5/minute for password reset, and 5/minute for email verification, with a 60/minute auth-wide limit.

The collection covers every route currently registered by the API, including Redis session listing/revocation, organization switching, browser OAuth redirects, and the API-key-protected test-run endpoint. OAuth requests require provider credentials; the callback is driven by the provider redirect rather than a manual Postman body.
