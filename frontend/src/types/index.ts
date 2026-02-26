export interface LoginRequest {
  uniqueCode: string;
  name: string;
}

export interface LoginResponse {
  userId: number;
  name: string;
  company: string | null;
  balance: number;
  token: string;
}

export interface UserResponse {
  userId: number;
  uniqueCode: string;
  name: string;
  company: string | null;
  balance: number;
}

export interface BoothResponse {
  id: number;
  name: string;
  category: string;
  description: string;
  shortDescription: string;
  displayOrder: number;
  logoEmoji: string;
  themeColor: string;
  totalInvestment: number;
  myInvestment: number;
}

export interface InvestmentResponse {
  boothId: number;
  boothName: string;
  logoEmoji: string;
  themeColor: string;
  amount: number;
}

export interface InvestmentHistoryResponse {
  id: number;
  boothId: number;
  boothName: string;
  logoEmoji: string;
  themeColor: string;
  type: 'INVEST' | 'WITHDRAW';
  amount: number;
  balanceAfter: number;
  createdAt: string;
}

export interface InvestRequest {
  boothId: number;
  amount: number;
}

export interface RankingResponse {
  rank: number;
  boothId: number;
  boothName: string;
  category: string;
  logoEmoji: string;
  themeColor: string;
  totalInvestment: number;
  investorCount: number;
}

export interface AnnouncementResponse {
  message: string;
  updatedAt: string;
}

export interface ZoneBoothItem {
  id: number;
  name: string;
  category: string;
  shortDescription: string;
  logoEmoji: string;
  themeColor: string;
}

export interface ZoneResponse {
  id: number;
  zoneCode: string;
  name: string;
  floorInfo: string;
  displayOrder: number;
  booths: ZoneBoothItem[];
}
// === 주식 (Stock) ===
export interface StockAccountResponse {
  userId: number;
  balance: number;
}

export interface StockHoldingResponse {
  boothId: number;
  boothName: string;
  logoEmoji: string;
  themeColor: string;
  amount: number;
}

export interface StockTradeHistoryResponse {
  id: number;
  boothId: number;
  boothName: string;
  logoEmoji: string;
  themeColor: string;
  type: 'BUY' | 'SELL';
  amount: number;
  priceAtTrade: number;
  balanceAfter: number;
  createdAt: string;
}

export interface StockBoothResponse {
  id: number;
  name: string;
  category: string;
  description: string;
  shortDescription: string;
  displayOrder: number;
  logoEmoji: string;
  themeColor: string;
  totalHolding: number;
  myHolding: number;
  hasVisited: boolean;
  hasRated: boolean;
}

export interface StockTradeRequest {
  boothId: number;
  amount: number;
}

export interface CospiPoint {
  price: number;
  changedAt: string;
}

export interface CospiResponse {
  currentTotal: number;
  previousTotal: number;
  change: number;
  changeRate: number;
  history: CospiPoint[];
}

export interface StockPricePoint {
  price: number;
  changedAt: string;
}

export interface StockPriceHistoryResponse {
  boothId: number;
  boothName: string;
  currentPrice: number;
  priceHistory: StockPricePoint[];
}

export interface StockCommentResponse {
  id: number;
  userId: number;
  userName: string;
  userCompany: string | null;
  content: string;
  tag: string;
  createdAt: string;
}

export interface IdeaBoardResponse {
  boothId: number;
  boothName: string;
  logoEmoji: string;
  themeColor: string;
  category: string;
  comments: StockCommentResponse[];
}

export interface UserMissionResponse {
  missionId: string;
  progress: number;
  target: number;
  isCompleted: boolean;
  achievementRate: number;
  isUsed: boolean;
  usedAt: string | null;
}

export interface MissionRankingItem {
  rank: number;
  userId: number;
  name: string;
  company: string | null;
  progress: number;
  rankChange: number;
}

export interface MissionRankingData {
  rankings: MissionRankingItem[];
  myRanking: MissionRankingItem | null;
}

// === 부스 평가 (Rating) ===
export interface StockRatingRequest {
  scoreFirst: number;
  scoreBest: number;
  scoreDifferent: number;
  scoreNumberOne: number;
  scoreGap: number;
  scoreGlobal: number;
  review?: string;
}

export interface StockRatingResponse {
  id: number;
  boothId: number;
  scoreFirst: number;
  scoreBest: number;
  scoreDifferent: number;
  scoreNumberOne: number;
  scoreGap: number;
  scoreGlobal: number;
  totalScore: number;
  review: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminBoothRatingResponse {
  boothId: number;
  boothName: string;
  logoEmoji: string;
  themeColor: string;
  ratingCount: number;
  totalScoreSum: number;
  avgFirst: number;
  avgBest: number;
  avgDifferent: number;
  avgNumberOne: number;
  avgGap: number;
  avgGlobal: number;
  avgTotal: number;
}

export interface VisitRequest {
  boothUuid: string;
}

export interface BoothVisitResponse {
  boothId: number;
  boothName: string;
  logoEmoji: string;
  message: string;
  visitedAt: string;
}

export interface MyBoothVisitorResponse {
  boothId: number | null;
  boothName: string | null;
  logoEmoji: string | null;
  visitorCount: number;
}

export interface BoothReviewResponse {
  id: number;
  userId: number;
  userName: string;
  userCompany: string | null;
  review: string;
  updatedAt: string;
}

// === 쪽지 (Note) ===
export interface NoteRequest {
  receiverId: number;
  content: string;
}

export interface NoteResponse {
  id: number;
  senderId: number;
  senderName: string;
  senderCompany: string | null;
  receiverId: number;
  receiverName: string;
  receiverCompany: string | null;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface UserSearchResponse {
  userId: number;
  name: string;
  company: string | null;
  uniqueCode: string;
}
