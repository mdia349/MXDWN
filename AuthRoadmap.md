# JWT auth, authorization, and sharing roadmap

### 1. Define the initial access policy
+[x] DONE
- Authenticated users own their projects.
- Owners control private project access.
- Public sharing means an unlisted, read-only mix link—not a public project.
### 2. Build JWT authentication
+[x] DONE
- Registration, login, BCrypt password hashing.
- JWT generation, validation, and request filter.
- Stateless security configuration.
- All normal API routes require authentication.

### 3. Associate projects with owners ← next
- Replace Project.artistId with Project.owner: User.
- Remove client-supplied ownership fields.
- Create/list projects using the JWT-authenticated user.
### 4. Enforce private owner access
- Require ownership before accessing a project’s mixes.
- Require ownership before uploads, deletes, comment reads/creates, and S3 URL generation.
- Return 403 Forbidden when an authenticated user lacks permission.
### 4A. Add unlisted mix sharing
- Add PRIVATE / UNLISTED visibility to Mix.
- Generate an opaque, cryptographically random share token for unlisted mixes.
- Add an unauthenticated, read-only endpoint such as /api/v1/public/mixes/{shareToken}.
- Return only safe mix data and a short-lived presigned stream URL.
- Allow the owner to enable, disable, and rotate/revoke the link.
- Add a frontend /share/:shareToken listening page.
- Keep uploads, project details, comments, edits, and deletes private.
### 5. Associate comments with authors
- Replace Comment.userId with Comment.author: User.
- Derive the author from the JWT.
- Restrict comment editing/deletion to the author and/or project owner.
### 6. Add backend authorization tests
- Login, invalid-token, and expired-token cases.
- User A cannot access User B’s private resources.
- Owner can access their own resources.
- Valid unlisted link can stream only its intended mix.
- Revoked/invalid share links fail.
### 7. Add frontend authentication
- Login and registration pages.
- Store token/current user.
- Axios Bearer-token interceptor.
- Protected React routes.
- Remove mock users and hardcoded IDs.
### 8. Add authenticated project collaborators
- Add ProjectMember with OWNER, EDITOR, and REVIEWER.
- Replace owner-only checks with permission checks.
- Support invited artists, producers, and engineers.
- Define who can upload, comment, manage members, and delete.
### 9. Production hardening
- Replace ddl-auto: create with Flyway migrations.
- Environment-specific secrets and CORS.
- Consistent 401, 403, and validation error responses.
- Token refresh/expiry strategy if needed.
- Ensure all S3 presigned URLs are authorized first.