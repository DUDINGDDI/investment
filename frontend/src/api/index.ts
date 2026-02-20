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
};

export const adminApi = {
  getStatus: () => api.get<{ revealed: boolean }>('/admin/results/status'),
  toggleResults: () => api.post<{ revealed: boolean }>('/admin/results/toggle'),
  getRanking: () => api.get<RankingResponse[]>('/admin/ranking'),
};
