import axiosClient from '../api/axiosClient';
import { SCHEDULE_ENDPOINTS } from '../api/endpoints';
import {
  CalendarEvent,
  CreateWeeklyEventRequest,
  CreateOneshotEventRequest,
  UpdateEventRequest,
  HeatmapData,
} from '../types';

// ─── Schedule Service ─────────────────────────────────────────────────────────

/**
 * Lấy danh sách sự kiện theo tháng (định dạng YYYY-MM)
 */
export const getMonthlyCalendar = async (month?: string): Promise<CalendarEvent[]> => {
  const response = await axiosClient.get<CalendarEvent[]>(SCHEDULE_ENDPOINTS.MONTHLY, {
    params: month ? { month } : undefined,
  });
  return response.data;
};

/**
 * Tạo sự kiện lặp lại hàng tuần
 */
export const createWeeklyEvent = async (payload: CreateWeeklyEventRequest): Promise<void> => {
  await axiosClient.post(SCHEDULE_ENDPOINTS.CREATE_WEEKLY, payload);
};

/**
 * Tạo sự kiện một lần (Oneshot)
 */
export const createOneshotEvent = async (payload: CreateOneshotEventRequest): Promise<void> => {
  await axiosClient.post(SCHEDULE_ENDPOINTS.CREATE_ONESHOT, payload);
};

/**
 * Cập nhật sự kiện (cả hàng tuần và một lần)
 */
export const updateEvent = async (eventId: string, payload: UpdateEventRequest): Promise<any> => {
  const response = await axiosClient.patch<any>(SCHEDULE_ENDPOINTS.UPDATE(eventId), payload);
  return response.data;
};

/**
 * Xóa sự kiện
 */
export const deleteEvent = async (eventId: string): Promise<void> => {
  await axiosClient.delete(SCHEDULE_ENDPOINTS.DELETE(eventId));
};

/**
 * Lấy bản đồ nhiệt độ rảnh/bận của nhóm (Heatmap)
 */
export const getGroupHeatmap = async (groupId: string): Promise<HeatmapData> => {
  const response = await axiosClient.get<HeatmapData>(SCHEDULE_ENDPOINTS.GROUP_HEATMAP(groupId));
  return response.data;
};
