import axiosClient from '../api/axiosClient';
import { CHECKLIST_ENDPOINTS } from '../api/endpoints';
import { Checklist } from '../types';

// ─── Checklist Service ────────────────────────────────────────────────────────

/**
 * Lấy tất cả danh sách checklist
 */
export const getChecklists = async (): Promise<Checklist[]> => {
  const response = await axiosClient.get<Checklist[]>(CHECKLIST_ENDPOINTS.LIST);
  return response.data;
};

/**
 * Gửi prompt chứa text cuộc hội thoại để AI trích xuất và tạo bản xem trước (Preview) checklist
 */
export const previewChecklist = async (prompt: string): Promise<Checklist> => {
  // Gửi prompt trực tiếp dưới dạng raw text hoặc wrap trong object tùy backend nhận
  const response = await axiosClient.post<Checklist>(CHECKLIST_ENDPOINTS.PREVIEW, { prompt });
  return response.data;
};

/**
 * Xác nhận lưu lại bản xem trước checklist đã được tạo bởi AI
 */
export const confirmChecklist = async (): Promise<Checklist> => {
  const response = await axiosClient.post<Checklist>(CHECKLIST_ENDPOINTS.CONFIRM);
  return response.data;
};
