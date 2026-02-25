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
  StockTradeRequest,
  StockHoldingResponse,
  StockTradeHistoryResponse,
  StockAccountResponse,
  StockBoothResponse,
  StockPriceHistoryResponse,
  StockCommentResponse,
  UserMissionResponse,
  MissionRankingData,
  StockRatingRequest,
  StockRatingResponse,
  AdminBoothRatingResponse,
  VisitRequest,
  BoothVisitResponse,
  BoothReviewResponse,
  NoteRequest,
  NoteResponse,
  UserSearchResponse,
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

export const stockApi = {
  buy: (data: StockTradeRequest) => api.post('/stocks/buy', data),
  sell: (data: StockTradeRequest) => api.post('/stocks/sell', data),
  getMy: () => api.get<StockHoldingResponse[]>('/stocks/my'),
  getHistory: () => api.get<StockTradeHistoryResponse[]>('/stocks/history'),
  getAccount: () => api.get<StockAccountResponse>('/stocks/account'),
  getBooths: () => api.get<StockBoothResponse[]>('/stocks/booths'),
  getBoothById: (id: number) => api.get<StockBoothResponse>(`/stocks/booths/${id}`),
  getPriceHistory: (id: number) => api.get<StockPriceHistoryResponse>(`/stocks/booths/${id}/price-history`),
  getBoothHistory: (boothId: number) => api.get<StockTradeHistoryResponse[]>(`/stocks/booths/${boothId}/my-history`),
  getComments: (boothId: number, tag?: string) => api.get<StockCommentResponse[]>(`/stocks/booths/${boothId}/comments`, { params: tag ? { tag } : {} }),
  addComment: (boothId: number, content: string, tag: string) => api.post<StockCommentResponse>(`/stocks/booths/${boothId}/comments`, { content, tag }),
  submitRating: (boothId: number, data: StockRatingRequest) => api.post<StockRatingResponse>(`/stocks/booths/${boothId}/rating`, data),
  getMyRating: (boothId: number) => api.get<StockRatingResponse>(`/stocks/booths/${boothId}/rating`),
  getBoothReviews: (boothId: number) => api.get<BoothReviewResponse[]>(`/stocks/booths/${boothId}/reviews`),
  deleteReview: (boothId: number) => api.delete(`/stocks/booths/${boothId}/rating/review`),
};

export const missionApi = {
  getMyMissions: () => api.get<UserMissionResponse[]>('/missions/my'),
  updateProgress: (missionId: string, progress: number) =>
    api.post<UserMissionResponse>('/missions/progress', { missionId, progress }),
  completeMission: (missionId: string) =>
    api.post<UserMissionResponse>('/missions/complete', { missionId }),
  getRanking: (missionId: string) =>
    api.get<MissionRankingData>('/missions/ranking', { params: { missionId } }),
};

export const visitApi = {
  visit: (data: VisitRequest) =>
    api.post<BoothVisitResponse>('/visits', data),
  getMyVisits: () =>
    api.get<BoothVisitResponse[]>('/visits/my'),
};

export const noteApi = {
  send: (data: NoteRequest) =>
    api.post('/notes', data),
  getReceived: () =>
    api.get<NoteResponse[]>('/notes/received'),
  getSent: () =>
    api.get<NoteResponse[]>('/notes/sent'),
  markAsRead: (noteId: number) =>
    api.patch(`/notes/${noteId}/read`),
  getUnreadCount: () =>
    api.get<{ count: number }>('/notes/unread-count'),
  searchUsers: (keyword: string) =>
    api.get<UserSearchResponse[]>('/notes/users/search', { params: { keyword } }),
};

export const adminApi = {
  getStatus: () => api.get<{ revealed: boolean }>('/admin/results/status'),
  toggleResults: () => api.post<{ revealed: boolean }>('/admin/results/toggle'),
  getRanking: () => api.get<RankingResponse[]>('/admin/ranking'),
  getAnnouncement: () => api.get<AnnouncementResponse>('/admin/announcement'),
  setAnnouncement: (message: string) => api.post<AnnouncementResponse>('/admin/announcement', { message }),
  clearAnnouncement: () => api.delete('/admin/announcement'),
  getBoothRatings: () => api.get<AdminBoothRatingResponse[]>('/admin/ratings'),
};
