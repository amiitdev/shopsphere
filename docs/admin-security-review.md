# Security Review: Admin Dashboard

## Scope
Review of the Admin Dashboard implementation including RBAC, API endpoints, and Frontend access.

## Findings

### 1. Authorization (RBAC)
- **Implementation**: The `isAdmin` middleware checks `req.user.role === 'admin'`.
- **Verdict**: **SECURE**. The role is derived from the JWT which is signed with `AUTH_SECRET`. Since the secret is stored in environment variables, users cannot forge an admin token.
- **Recommendation**: Ensure `AUTH_SECRET` is rotated periodically.

### 2. Input Validation
- **Implementation**: `zod` is used in `adminController.ts` to validate product creation and updates.
- **Verdict**: **SECURE**. Schema validation prevents malformed data or NoSQL injection attempts via product fields.
- **Recommendation**: Add specific validation for `image` URLs to prevent XSS if image URLs are rendered unsanitized in the admin panel.

### 3. Access Control (Frontend)
- **Implementation**: The `/admin` routes are defined in `App.tsx`.
- **Verdict**: **PARTIAL**. While the backend is secure (403 Forbidden), the frontend UI might still show the admin layout if the user navigates to `/admin/products` manually.
- **Recommendation**: Implement a `ProtectedRoute` component in React that checks the user's role before rendering the `AdminLayout`.

### 4. Order Cancellation
- **Implementation**: `cancelOrder` in `adminController.ts` updates the status to 'Cancelled'.
- **Verdict**: **SECURE**. The operation is protected by `isAdmin`.

## Summary
The critical security boundary (the API) is properly protected. The primary risk is a minor UX issue where a non-admin can see a blank or error-filled admin page, but they cannot perform any administrative actions.
