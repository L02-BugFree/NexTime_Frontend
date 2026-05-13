import axiosClient from '../api/axiosClient';
import { ROOM_ENDPOINTS } from '../api/endpoints';
import { Room, CreateRoomRequest, Message, HeatmapData } from '../types';

// ─── Room Service ─────────────────────────────────────────────────────────────

/**
 * Tạo một phòng chat mới (SELF, DIRECT hoặc GROUP)
 */
export const createRoom = async (payload: CreateRoomRequest): Promise<Room> => {
  const response = await axiosClient.post<Room>(ROOM_ENDPOINTS.CREATE, payload);
  return response.data;
};

/**
 * Danh sách phòng chat của người dùng hiện tại
 */
export const getRooms = async (): Promise<Room[]> => {
  const response = await axiosClient.get<Room[]>(ROOM_ENDPOINTS.LIST);
  return response.data;
};

/**
 * Lấy lịch sử tin nhắn của một phòng có phân trang
 */
export const getRoomMessages = async (
  roomId: string,
  page = 1,
  limit = 50,
): Promise<Message[]> => {
  const response = await axiosClient.get<Message[]>(ROOM_ENDPOINTS.MESSAGES(roomId), {
    params: { page, limit },
  });
  return response.data;
};

/**
 * Gửi một tin nhắn mới vào phòng
 */
export const sendMessage = async (roomId: string, content: string): Promise<Message> => {
  const response = await axiosClient.post<Message>(ROOM_ENDPOINTS.SEND_MESSAGE(roomId), { content });
  return response.data;
};

/**
 * Lấy Heatmap overlay lịch trình bận/rảnh của phòng chat (để hiển thị bản đồ nhiệt độ nhóm)
 */
export const getRoomHeatmap = async (roomId: string, month?: string): Promise<HeatmapData> => {
  const response = await axiosClient.get<HeatmapData>(ROOM_ENDPOINTS.ROOM_HEATMAP(roomId), {
    params: month ? { month } : undefined,
  });
  return response.data;
};
