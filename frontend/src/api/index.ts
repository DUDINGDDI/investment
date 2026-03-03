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
  CospiResponse,
  StockCommentResponse,
  UserMissionResponse,
  MissionRankingData,
  StockRatingRequest,
  StockRatingResponse,
  AdminBoothRatingResponse,
  StockBoothVisitResponse,
  MyStockVisitResponse,
  MyStockBoothVisitorResponse,
  BoothReviewResponse,
  NoteRequest,
  NoteResponse,
  UserSearchResponse,
  IdeaBoardResponse,
  ReportEligibilityResponse,
  ReportResponse,
  ShareReportRequest,
  SharedReportResponse,
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
  submitRating: (boothId: number, data: StockRatingRequest) => api.post<StockRatingResponse>(`/booths/${boothId}/rating`, data),
  getMyRating: (boothId: number) => api.get<StockRatingResponse>(`/booths/${boothId}/rating`),
  getBoothReviews: (boothId: number) => api.get<BoothReviewResponse[]>(`/booths/${boothId}/reviews`),
  deleteReview: (boothId: number) => api.delete(`/booths/${boothId}/rating/review`),
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
  getInvestmentStatus: () => api.get<{ enabled: boolean }>('/results/investment-status'),
  getStockStatus: () => api.get<{ enabled: boolean }>('/results/stock-status'),
  getRanking: () => api.get<RankingResponse[]>('/results/ranking'),
  getAnnouncement: () => api.get<AnnouncementResponse>('/results/announcement'),
  getMissionResultStatus: () => api.get<{ revealed: boolean }>('/results/mission-result-status'),
  getDreamStatus: () => api.get<{ enabled: boolean }>('/results/dream-status'),
  getStockRankingStatus: () => api.get<{ enabled: boolean }>('/results/stock-ranking-status'),
};

export const zoneApi = {
  getAll: () => api.get<ZoneResponse[]>('/zones'),
  getByCode: (zoneCode: string) => api.get<ZoneResponse>(`/zones/${zoneCode}`),
};

export const stockApi = {
  visit: (boothUuid: string) =>
    api.post<StockBoothVisitResponse>('/stocks/visit', { boothUuid }),
  buy: (data: StockTradeRequest) => api.post('/stocks/buy', data),
  sell: (data: StockTradeRequest) => api.post('/stocks/sell', data),
  getMy: () => api.get<StockHoldingResponse[]>('/stocks/my'),
  getHistory: () => api.get<StockTradeHistoryResponse[]>('/stocks/history'),
  getAccount: () => api.get<StockAccountResponse>('/stocks/account'),
  getBooths: () => api.get<StockBoothResponse[]>('/stocks/booths'),
  getBoothById: (id: number) => api.get<StockBoothResponse>(`/stocks/booths/${id}`),
  getPriceHistory: (id: number) => api.get<StockPriceHistoryResponse>(`/stocks/booths/${id}/price-history`),
  getBoothHistory: (boothId: number) => api.get<StockTradeHistoryResponse[]>(`/stocks/booths/${boothId}/my-history`),
  getComments: (boothId: number) => api.get<StockCommentResponse[]>(`/stocks/booths/${boothId}/comments`),
  addComment: (boothId: number, content: string, tag?: string) => api.post<StockCommentResponse>(`/stocks/booths/${boothId}/comments`, { content, tag }),
  submitRating: (boothId: number, data: StockRatingRequest) => api.post<StockRatingResponse>(`/stocks/booths/${boothId}/rating`, data),
  getMyRating: (boothId: number) => api.get<StockRatingResponse>(`/stocks/booths/${boothId}/rating`),
  getBoothReviews: (boothId: number) => api.get<BoothReviewResponse[]>(`/stocks/booths/${boothId}/reviews`),
  deleteReview: (boothId: number) => api.delete(`/stocks/booths/${boothId}/rating/review`),
  getCospi: () => api.get<CospiResponse>('/stocks/cospi'),
  getMyVisits: () => api.get<MyStockVisitResponse[]>('/stocks/visits/my'),
  getMyBoothVisitors: () => api.get<MyStockBoothVisitorResponse>('/stocks/visits/booth-visitors'),
};

export const missionApi = {
  getMyMissions: () => api.get<UserMissionResponse[]>('/missions/my'),
  updateProgress: (missionId: string, progress: number) =>
    api.post<UserMissionResponse>('/missions/progress', { missionId, progress }),
  completeMission: (missionId: string) =>
    api.post<UserMissionResponse>('/missions/complete', { missionId }),
  completeTogether: (uuid: string) =>
    api.post<UserMissionResponse>('/missions/together', { boothUuid: uuid }),
  getRanking: (missionId: string) =>
    api.get<MissionRankingData>('/missions/ranking', { params: { missionId } }),
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

export const ideaBoardApi = {
  getBoard: (boothId: number) =>
    api.get<IdeaBoardResponse>(`/idea-board/booths/${boothId}`),
};

export const reportApi = {
  checkEligibility: () =>
    api.get<ReportEligibilityResponse>('/report/eligibility'),
  getReport: () =>
    api.get<ReportResponse>('/report'),
  shareReport: (data: ShareReportRequest) =>
    api.post('/report/share', data),
  getShareStatus: () =>
    api.get<{ shared: boolean }>('/report/share/status'),
  getSharedReports: () =>
    api.get<SharedReportResponse[]>('/report/shared'),
};

export const adminApi = {
  getStatus: () => api.get<{ revealed: boolean }>('/admin/results/status'),
  toggleResults: () => api.post<{ revealed: boolean }>('/admin/results/toggle'),
  getInvestmentStatus: () => api.get<{ enabled: boolean }>('/admin/investment/status'),
  toggleInvestment: () => api.post<{ enabled: boolean }>('/admin/investment/toggle'),
  getStockStatus: () => api.get<{ enabled: boolean }>('/admin/stock/status'),
  toggleStock: () => api.post<{ enabled: boolean }>('/admin/stock/toggle'),
  getRanking: () => api.get<RankingResponse[]>('/admin/ranking'),
  getAnnouncement: () => api.get<AnnouncementResponse>('/admin/announcement'),
  setAnnouncement: (message: string) => api.post<AnnouncementResponse>('/admin/announcement', { message }),
  clearAnnouncement: () => api.delete('/admin/announcement'),
  getMissionResultStatus: () => api.get<{ revealed: boolean }>('/admin/mission-result/status'),
  toggleMissionResult: () => api.post<{ revealed: boolean }>('/admin/mission-result/toggle'),
  getDreamStatus: () => api.get<{ enabled: boolean }>('/admin/dream/status'),
  toggleDream: () => api.post<{ enabled: boolean }>('/admin/dream/toggle'),
  getStockRankingStatus: () => api.get<{ enabled: boolean }>('/admin/stock-ranking/status'),
  toggleStockRanking: () => api.post<{ enabled: boolean }>('/admin/stock-ranking/toggle'),
  getBoothRatings: () => api.get<AdminBoothRatingResponse[]>('/admin/ratings'),
  getPmBoothRatings: () => api.get<AdminBoothRatingResponse[]>('/admin/booth-ratings'),
  useTicket: (userId: number, missionId: string) =>
    api.post<UserMissionResponse>('/admin/tickets/use', { userId, missionId }),
};
