// Info for Protected Url to access by Staff and Admin and SuperAdmin's
export const ProtectedUrls = [
  {
    url: 'dashboard',
    accessTo: ['SuperAdmin', 'Admin']
  },
  {
    url: 'inventory',
    accessTo: ['SuperAdmin', 'Admin']
  },
  {
    url: 'settings',
    accessTo: ['SuperAdmin', 'Admin']
  },
  {
    url: 'booking',
    accessTo: ['SuperAdmin', 'Admin', 'StoreManager', 'Staff']
  },
  {
    url: 'sessions',
    accessTo: ['SuperAdmin', 'Admin', 'StoreManager', 'Staff']
  },
  {
    url: 'reports',
    accessTo: ['SuperAdmin', 'Admin']
  },
]
