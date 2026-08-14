# Loop: API documentation

BASE API URL: http://localhost:3000

Authenticated endpoints require a
'Authorization: Bearer <access_token>' header

Access tokens expire after 15 minutes and use
'POST /api/auth/refresh' to obtain a new one from
a stored refresh token.

User roles are as follows:
'pharmacy_staff',
'pharmacy_manager',
'practice_staff',
'practice_manager' and
'admin'

The term "Manager roles" refers to:
'pharmacy_manager',
'practice_manager' and
'admin'

--

## Auth

### 'POST /api/auth/login'

Public route.
Body - {email, password}
Response: '200': {access_token, refresh_token, user: {id, first_name, last_name, email, role, organisation, organisation_name}}
Errors: '400': missing fields - '401': invalid credentials

### 'POST /api/auth/logout'

Authorised-only route.
Body - {refresh_token}
Response: '200': {message} (refresh_token revoked)
Errors: '400': missing refresh token

### 'POST /api/auth/refresh'

Public route.
Body - {refresh_token}
Response: '200': {access_token}
Errors: '400': missing token/email - '401': invalid/expired/revoked token, or account is deactivated

### 'POST /api/auth/forgot_password'

Public route.
Body - {email}
Response: '200': regardless of whether the email exists or not(does not leak account existence). Sends a reset email if the account is found and is active.

### 'POST /api/auth/reset_password'

Authorised-only route (requries reset token).
Body - {token, new_password} (password = min. 8 characters)
Response: '200': {message} - revokes all of that user's existing refresh tokens.
Errors: '400': invalid/expired token, missing fields, or password too short

### 'GET /api/auth/get_user'

Authorised-only route.
Response: '200': {user: {id, first_name, last_name, email, role, organisation, organisation_name}} — current user's profile, used to restore session state on page reloads
Errors: '404': user not found -

### 'PATCH /api/auth/update'

Authorised-only route.
Body - {first_name, last_name, email} — updates the caller's own name/email only. Role and organisation can never be changed via this endpoint.
Response: '200': { user }
Errors: '400': missing fields - '409': email already in use by another account - '404': user not found

--

## Queries

--

## Organisations

--

## Notifications

--

## Staff Management

--

## Admin

--

## Reports

--

## Errors
