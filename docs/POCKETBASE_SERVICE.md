# PocketBase Service Documentation

## Overview
The PocketBase service handles all database interactions and authentication for the application, configured to work with a remote PocketBase instance.

## Configuration

### Base Setup
```javascript
const PB_URL = 'http://example.com:8090';
const pb = new PocketBase(PB_URL);
```

### Authentication Store
- Persistent authentication state
- Automatic token management
- Event-driven auth state changes

## Core Collections

### Users (`_pb_users_auth_`)
- Authentication collection
- Stores user credentials and profiles
- Supports role-based access

### Branches
- Store information about café locations
- Links to staff assignments
- Coordinates for geofencing

### Staff Logins
- Tracks attendance and sessions
- Stores location data
- Maintains audit trail

## Authentication Methods

### Login
```javascript
async function login(username, password) {
  return await pb.collection("users").authWithPassword(username, password);
}
```

### Logout
```javascript
async function logout() {
  pb.authStore.clear();
}
```

## Security Rules

### Collection Access
- Users: Self-management and SuperAdmin access
- Branches: Protected creation/modification
- Staff Logins: Automated tracking

### Role-Based Access
```javascript
const ProtectedUrls = [
  {
    url: 'dashboard',
    accessTo: ['SuperAdmin', 'Admin']
  },
  {
    url: 'booking',
    accessTo: ['SuperAdmin', 'Admin', 'StoreManager', 'Staff']
  }
]
```

## Error Handling
- Authentication failures
- Network issues
- Permission denials
- Invalid operations

## Best Practices

1. Always check authentication state
2. Handle token expiration
3. Implement proper error handling
4. Use role-based access control
5. Maintain audit logs

## Usage Examples

### Authentication Check
```javascript
if (!pb.authStore.isValid) {
  redirect('/login');
}
```

### Protected Route Access
```javascript
useEffect(() => {
  if (!isValid) {
    toast.info('User is not Authenticated');
    return redirect('/login');
  }
}, [isValid]);
```
