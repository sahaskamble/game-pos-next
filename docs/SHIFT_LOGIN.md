# Shift-Code Based Login System

## Overview
The system implements a location-aware authentication system for staff members, ensuring they can only log in when physically present at their assigned café branch.

## Key Components

### Authentication Flow
1. User provides:
   - Username
   - Password
   - Branch selection

2. Location Verification
   - System checks user's geolocation
   - Validates distance from café coordinates
   - Enforces maximum allowed radius (currently set for café premises)

3. Branch Authorization
   - Verifies user's assignment to selected branch
   - Prevents unauthorized branch access

### Staff Login Records
- System logs each login/logout event
- Stores:
  - User ID
  - Branch ID
  - Login timestamp
  - Geolocation coordinates
  - Logout timestamp (updated when session ends)

## Security Measures

### Geofencing
- Real-time location validation
- Configurable radius restriction
- GPS accuracy requirements

### Branch Access Control
- Role-based access control (RBAC)
- Branch-specific permissions
- SuperAdmin override capabilities

## Error Handling

Common Error Scenarios:
- Location services disabled
- Outside permitted radius
- Unauthorized branch access
- Invalid credentials

## Database Schema

### Staff Logins Table
```json
{
  "name": "staff_logins",
  "fields": {
    "user_id": "Relation(users)",
    "branch_id": "Relation(branches)",
    "login_time": "DateTime",
    "logout_time": "DateTime",
    "location": {
      "lat": "Number",
      "lon": "Number"
    }
  }
}
```