import axiosClient from '../api/axiosClient';
import { AI_ENDPOINTS } from '../api/endpoints';

// ─── AI Assistant Service ─────────────────────────────────────────────────────

/**
 * Gọi AI Assistant theo ngữ cảnh của phòng chat để trả lời hoặc thực hiện tác vụ tự động
 */
export const askAIAssistant = async (roomId: string, prompt: string): Promise<string> => {
  const response = await axiosClient.post<{ reply: string }>(
    AI_ENDPOINTS.ASSISTANT(roomId),
    { prompt },
  );
  return response.data?.reply || '';
};
