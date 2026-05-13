import axiosClient from '../api/axiosClient';
import { POLL_ENDPOINTS } from '../api/endpoints';
import { Poll, CreatePollRequest, VoteRequest } from '../types';

// ─── Poll Service (Smart Group Voting) ────────────────────────────────────────

/**
 * Tạo một cuộc biểu quyết bình chọn lịch trình tối ưu dựa trên thời gian trống của các thành viên
 */
export const createPoll = async (payload: CreatePollRequest): Promise<Poll> => {
  const response = await axiosClient.post<Poll>(POLL_ENDPOINTS.CREATE, payload);
  return response.data;
};

/**
 * Bỏ phiếu YES/NO cho một đề xuất khung giờ cụ thể trong cuộc biểu quyết
 */
export const votePollOption = async (
  pollId: string,
  optionIndex: number,
  value: 'YES' | 'NO',
): Promise<void> => {
  const payload: VoteRequest = { optionIndex, value };
  await axiosClient.post(POLL_ENDPOINTS.VOTE(pollId), payload);
};
