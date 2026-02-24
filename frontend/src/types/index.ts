export interface LoginRequest {
  uniqueCode: string;
  name: string;
}

export interface LoginResponse {
  userId: number;
  name: string;
  balance: number;
  token: string;
}

export interface UserResponse {
  userId: number;
  uniqueCode: string;
  name: string;
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
  currentPrice: number;
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
  currentPrice: number;
  totalHolding: number;
  myHolding: number;
}

export interface StockTradeRequest {
  boothId: number;
  amount: number;
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
  content: string;
  createdAt: string;
}
