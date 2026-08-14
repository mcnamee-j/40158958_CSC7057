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

All queries routes require auth and a scoped role:

- 'pharmacy_staff'
- 'pharmacy_manager'
- 'practice_staff'
- 'practice_manager'

### 'POST /api/queries/'

Creates a new query.
Body - {recipient_org_id, category, priority?, patient?, subject, body}

- patient (optional): {initials?, dob?, hcn?} - if provided. require 2 of 3 patient identifiers
- priority defaults to medium

Response: '201': {query}
Errors: '400': missing fields or invalid patient identifiers - '403': organisations not linked

### 'GET /api/queries/'

Lists queries visible to the caller's organisation.
Query Params (all optional): 'status', 'category', 'priority', 'search' (subject/ref. number), 'patient_initials', 'patient_dob', 'patient_hcn', 'org_id', 'date' (date raised, YYYY-MM-DD), 'assigned_to' (user_id), 'page', 'limit' (default 20)
Response: '200': {queries: [...], total}

### 'GET /api/queries/:id'

Retrieves a specific query with its full query thread. Marks any unread non-internal replies from other organisation as read.
Response: '200': {query, replies: [...]}
Errors: '404': query not found - '400': invalid query id

### 'POST /api/queries/:id/replies'

Adds reply or internal note.
Body: {body, is_internal?} (default 'false')
Adding a reply (non-internal) on 'new' query, progresses status to 'in_progress'
Response: '201': {reply}
Errors: '400': empty/missing body - '404': query not found

### 'PATCH /api/queries/:id/status'

Body: {status, reoslution_note?}

- status: 'new', 'in_progress', 'escalated', 'resolved'
- resolution notes only stored when resolved using sidebar status dropdown method on UI

Response: '200': {query}
Errors: '400' invalid/missing status - '404': query not found

### 'PATCH /api/queries/:id/assign'

Body: {assigned_to, escalate?}

- assigned_to: must be an active user in the caller's organsiation
- escalate: if 'true', sets status to 'escalated'

Response: '200': {query}
Errors: '400': invalid/missing assignee - '404': query not found

--

## Organisations

### 'GET /api/organisations/linked'

Authorised-only route. Returns organisations linked to caller's organisation. Used to populate recipient dropdown on query creation. Returns only active organisations.
Response: '200': {organisations: [{id, name, type}]}

### 'GET /api/organisations/staff'

Authorised-only route. Returns active colleagues, excluding caller. Used to populate assignment dropdown on query thread page.
Response: '200': {staff: [{id, first_name, last_name, role}]}

--

## Notifications

All routes require auth; Notifications are scoped to the requesting user.

### 'GET /api/notifications/'

Response: '200': {notifications: [{id, query_id, type, message, is_read, created_at}]} (most recent 50)

### 'PATCH /api/notifications/:id/read'

Marks a notification as read. A user can mark only their own notifications as read.
Response: '200': {message}
Errors: '404': not found

### 'PATCH /api/notifications/read-all'

Marks all the caller's notifications as read.
Response: '200': {message}

--

## Staff Management

'GET' is open to all authenticated organisational roles (read access for filter dropdowns). Creating, deactivating, reactivating and requesting a password reset email are restricted to manager roles.

Admin users must pass an organisation's id as a query param to specify which organisation they are managing on the staff page.

### 'GET /api/staff/'

Query Params (admin only): organisation_id
Response: '200': {staff: [{id, first_name, last_name, email, role, active}]}

### 'POST /api/staff/'

Manager roles only. Creates new staff account - emails new user's email with a link to set password reusing the reset-password flow.
Body: { first_name, last_name, email, role, organisation_id?}
Response: '201': {staff}
Errors: '400': Invalid role for organisation type/missing org id (admin only) - '409': email already in use
--

## Admin

--

## Reports

--

## Errors
