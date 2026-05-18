import axiosClient from '../api/axiosClient';
import { APP_ENDPOINTS } from '../api/endpoints';
import { Checklist } from '../types';

export const getChecklists = async (): Promise<Checklist[]> => {
  const response = await axiosClient.get(APP_ENDPOINTS.ROOT);
  if (Array.isArray(response.data)) {
    return response.data;
  }
  // Nếu API trả về gì khác ngoài mảng, fallback về mảng rỗng để không bị crash
  return [];
};

export const previewChecklist = async (prompt: string): Promise<Checklist> => {
  const response = await axiosClient.post('/checklists/preview', { prompt });
  return response.data;
};

export const confirmChecklist = async (): Promise<void> => {
  await axiosClient.post('/checklists/confirm');
};
