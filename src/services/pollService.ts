import axiosClient from '../api/axiosClient';
import { POLL_ENDPOINTS } from '../api/endpoints';
import { CreatePollRequest, VoteRequest, Poll } from '../types';

export const createPoll = async (payload: CreatePollRequest): Promise<Poll> => {
  const response = await axiosClient.post<Poll>(POLL_ENDPOINTS.CREATE, payload);
  return response.data;
};

export const votePoll = async (pollId: string, payload: VoteRequest): Promise<any> => {
  const response = await axiosClient.post<any>(POLL_ENDPOINTS.VOTE(pollId), payload);
  return response.data;
};
