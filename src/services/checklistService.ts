import axiosClient from '../api/axiosClient';
import { APP_ENDPOINTS } from '../api/endpoints';
import { Checklist } from '../types';

export const getChecklists = async (): Promise<Checklist[]> => {
  const response = await axiosClient.get<Checklist[]>(APP_ENDPOINTS.ROOT);
  return response.data;
};
