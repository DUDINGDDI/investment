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
  isExecutive: boolean;
  isRookie: boolean;
}

export interface UserResponse {
  userId: number;
  uniqueCode: string;
  name: string;
  company: string | null;
  balance: number;
  isExecutive: boolean;
  isRookie: boolean;
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
  hasRated: boolean;
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
  floor: string;
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
  zoneName: string;
  floorInfo: string;
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
  tag: string | null;
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

export interface StockBoothVisitResponse {
  boothId: number;
  boothName: string;
  logoEmoji: string;
  message: string;
}

export interface MyStockVisitResponse {
  boothId: number;
  boothName: string;
  logoEmoji: string;
  visitedAt: string;
}

export interface MyStockBoothVisitorResponse {
  boothName: string;
  logoEmoji: string;
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

// === 투자 성향 리포트 ===
export interface ReportEligibilityResponse {
  eligible: boolean;
  morningVisitCount: number;
  afternoonVisitCount: number;
  morningRequired: number;
  afternoonRequired: number;
}

export interface ReportPortfolioItem {
  boothId: number;
  boothName: string;
  logoEmoji: string;
  themeColor: string;
  amount: number;
  percentage: number;
}

export interface ReportResponse {
  eligible: boolean;
  ineligibleReason: string | null;
  userName: string;
  userCompany: string | null;
  tendencyType: string;
  tendencyName: string;
  tendencyEmoji: string;
  tendencyOneLiner: string;
  diversity: number;
  activeness: number;
  stability: number;
  creativity: number;
  insight: number;
  totalInvested: number;
  currentBalance: number;
  investedBoothCount: number;
  totalTradeCount: number;
  ideaCount: number;
  ratingAverage: number;
  portfolio: ReportPortfolioItem[];
  topBoothName: string | null;
  topBoothEmoji: string | null;
  topBoothAmount: number;
  morningVisitCount?: number;
  afternoonVisitCount?: number;
}

export interface ShareReportRequest {
  vision: string;
}

export interface SharedReportResponse {
  userId: number;
  userName: string;
  userCompany: string | null;
  tendencyType: string;
  tendencyName: string;
  tendencyEmoji: string;
  tendencyOneLiner: string;
  vision: string;
  createdAt: string;
}

// === 임원 투자 집계 ===
export interface ExecutiveInvestmentResponse {
  executives: ExecutiveDetail[];
  boothSummaries: BoothSummaryItem[];
}

export interface ExecutiveDetail {
  userId: number;
  name: string;
  company: string | null;
  balance: number;
  totalInvested: number;
  investments: ExecutiveInvestmentItem[];
}

export interface ExecutiveInvestmentItem {
  boothId: number;
  boothName: string;
  logoEmoji: string;
  amount: number;
  memo: string | null;
}

export interface BoothSummaryItem {
  boothId: number;
  boothName: string;
  logoEmoji: string;
  themeColor: string;
  executiveInvestment: number;
  executiveInvestorCount: number;
}
