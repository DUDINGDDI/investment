import api from './client';
import type {
  LoginRequest,
  LoginResponse,
  UserResponse,
  BoothResponse,
  InvestRequest,
  InvestmentResponse,
  InvestmentHistoryResponse,
  RankingResponse,
  AnnouncementResponse,
  ZoneResponse,
} from '../types';

export const authApi = {
  login: (data: LoginRequest) =>
    api.post<LoginResponse>('/auth/login', data),
};

export const userApi = {
  getMe: () => api.get<UserResponse>('/users/me'),
};

export const boothApi = {
  getAll: () => api.get<BoothResponse[]>('/booths'),
  getById: (id: number) => api.get<BoothResponse>(`/booths/${id}`),
};

export const investmentApi = {
  invest: (data: InvestRequest) =>
    api.post('/investments/invest', data),
  withdraw: (data: InvestRequest) =>
    api.post('/investments/withdraw', data),
  getMy: () => api.get<InvestmentResponse[]>('/investments/my'),
  getHistory: () =>
    api.get<InvestmentHistoryResponse[]>('/investments/history'),
};

export const resultApi = {
  getStatus: () => api.get<{ revealed: boolean }>('/results/status'),
  getRanking: () => api.get<RankingResponse[]>('/results/ranking'),
  getAnnouncement: () => api.get<AnnouncementResponse>('/results/announcement'),
};

export const zoneApi = {
  getAll: () => api.get<ZoneResponse[]>('/zones'),
  getByCode: (zoneCode: string) => api.get<ZoneResponse>(`/zones/${zoneCode}`),
};

export const adminApi = {
  getStatus: () => api.get<{ revealed: boolean }>('/admin/results/status'),
  toggleResults: () => api.post<{ revealed: boolean }>('/admin/results/toggle'),
  getRanking: () => api.get<RankingResponse[]>('/admin/ranking'),
  getAnnouncement: () => api.get<AnnouncementResponse>('/admin/announcement'),
  setAnnouncement: (message: string) => api.post<AnnouncementResponse>('/admin/announcement', { message }),
  clearAnnouncement: () => api.delete('/admin/announcement'),
};
