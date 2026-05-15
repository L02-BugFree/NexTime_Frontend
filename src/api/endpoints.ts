// ─── Authentication ───────────────────────────────────────────────────────────
export const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  REFRESH_TOKEN: '/auth/refresh',
  ME: '/auth/me',
} as const;

// ─── Schedule ─────────────────────────────────────────────────────────────────
export const SCHEDULE_ENDPOINTS = {
  LIST: '/schedules',
  DETAIL: (id: string) => `/schedules/${id}`,
  CREATE: '/schedules',
  UPDATE: (id: string) => `/schedules/${id}`,
  DELETE: (id: string) => `/schedules/${id}`,
} as const;

// ─── Checklist ────────────────────────────────────────────────────────────────
export const CHECKLIST_ENDPOINTS = {
  LIST: '/checklists',
  DETAIL: (id: string) => `/checklists/${id}`,
  CREATE: '/checklists',
  UPDATE: (id: string) => `/checklists/${id}`,
  DELETE: (id: string) => `/checklists/${id}`,
  TOGGLE_ITEM: (checklistId: string, itemId: string) =>
    `/checklists/${checklistId}/items/${itemId}/toggle`,
} as const;

// ─── Profile ──────────────────────────────────────────────────────────────────
export const PROFILE_ENDPOINTS = {
  GET: '/profile',
  UPDATE: '/profile',
  UPLOAD_AVATAR: '/profile/avatar',
} as const;
