// ─── Authentication ───────────────────────────────────────────────────────────
export const AUTH_ENDPOINTS = {
  REGISTER: '/auth/register',
  LOGIN: '/auth/login',
  GOOGLE: '/auth/google',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  LOGOUT: '/auth/logout',
} as const;

// ─── Users & Social ───────────────────────────────────────────────────────────
export const USER_ENDPOINTS = {
  ME: '/users/me',
  UPDATE_PROFILE: '/users/profile',
  UPDATE_PRIVACY: '/users/privacy',
  UPDATE_VISIBILITY: '/users/visibility',
  GET_QR: '/users/qr',
  DELETE_ACCOUNT: '/users/account',
  SEARCH: '/users/search',
  // Friends
  LIST_FRIENDS: '/users/friends',
  FRIEND_REQUEST: '/users/friends/request',
  FRIEND_ACCEPT: '/users/friends/accept',
  REMOVE_FRIEND: (friendId: string) => `/users/friends/${friendId}`,
  // Blocks
  BLOCKS: '/users/blocks',
  UNBLOCK: (targetUserId: string) => `/users/blocks/${targetUserId}`,
} as const;

// ─── Schedules ────────────────────────────────────────────────────────────────
export const SCHEDULE_ENDPOINTS = {
  CREATE_WEEKLY: '/schedule/weekly',
  CREATE_ONESHOT: '/schedule/oneshot',
  MONTHLY: '/schedule/monthly', // param ?month=YYYY-MM
  GROUP_HEATMAP: (groupId: string) => `/schedule/heatmap/${groupId}`,
  UPDATE: (eventId: string) => `/schedule/${eventId}`,
  DELETE: (eventId: string) => `/schedule/${eventId}`,
} as const;

// ─── Checklists ───────────────────────────────────────────────────────────────
export const CHECKLIST_ENDPOINTS = {
  LIST: '/checklists',
  PREVIEW: '/checklists/preview',
  CONFIRM: '/checklists/confirm',
} as const;

// ─── Rooms & Messages ─────────────────────────────────────────────────────────
export const ROOM_ENDPOINTS = {
  CREATE: '/rooms',
  LIST: '/rooms',
  MESSAGES: (roomId: string) => `/rooms/${roomId}/messages`, // query params ?limit=&page=
  SEND_MESSAGE: (roomId: string) => `/rooms/${roomId}/messages`,
  ROOM_HEATMAP: (roomId: string) => `/rooms/${roomId}/heatmap`, // query ?month=
} as const;

// ─── Polls ────────────────────────────────────────────────────────────────────
export const POLL_ENDPOINTS = {
  CREATE: '/polls',
  VOTE: (pollId: string) => `/polls/${pollId}/vote`,
} as const;

// ─── AI Assistant ─────────────────────────────────────────────────────────────
export const AI_ENDPOINTS = {
  ASSISTANT: (roomId: string) => `/ai/assistant/${roomId}`,
} as const;
