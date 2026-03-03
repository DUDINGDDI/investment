package com.pm.investment.service;

import com.pm.investment.dto.ReportEligibilityResponse;
import com.pm.investment.dto.ReportResponse;
import com.pm.investment.dto.SharedReportResponse;
import com.pm.investment.entity.Investment;
import com.pm.investment.entity.InvestmentHistory;
import com.pm.investment.entity.SharedReport;
import com.pm.investment.entity.User;
import com.pm.investment.repository.*;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final UserRepository userRepository;
    private final InvestmentRepository investmentRepository;
    private final InvestmentHistoryRepository investmentHistoryRepository;
    private final BoothVisitRepository boothVisitRepository;
    private final StockBoothVisitRepository stockBoothVisitRepository;
    private final StockCommentRepository stockCommentRepository;
    private final StockRatingRepository stockRatingRepository;
    private final SharedReportRepository sharedReportRepository;

    private static final int TOTAL_BOOTH_COUNT = 9;

    @Transactional(readOnly = true)
    public ReportEligibilityResponse checkEligibility(Long userId) {
        LocalDate today = LocalDate.now();
        LocalDateTime morningStart = today.atTime(9, 0);
        LocalDateTime morningEnd = today.atTime(12, 0);
        LocalDateTime afternoonStart = today.atTime(12, 0);
        LocalDateTime afternoonEnd = today.atTime(14, 0);

        long morningBooth = boothVisitRepository.countByUserIdAndVisitedAtBetween(userId, morningStart, morningEnd);
        long morningStock = stockBoothVisitRepository.countByUserIdAndVisitedAtBetween(userId, morningStart, morningEnd);
        int morningTotal = (int) (morningBooth + morningStock);

        long afternoonBooth = boothVisitRepository.countByUserIdAndVisitedAtBetween(userId, afternoonStart, afternoonEnd);
        long afternoonStock = stockBoothVisitRepository.countByUserIdAndVisitedAtBetween(userId, afternoonStart, afternoonEnd);
        int afternoonTotal = (int) (afternoonBooth + afternoonStock);

        return ReportEligibilityResponse.builder()
                .eligible(morningTotal >= 10 && afternoonTotal >= 5)
                .morningVisitCount(morningTotal)
                .afternoonVisitCount(afternoonTotal)
                .morningRequired(10)
                .afternoonRequired(5)
                .build();
    }

    @Transactional(readOnly = true)
    public ReportResponse generateReport(Long userId) {
        ReportEligibilityResponse eligibility = checkEligibility(userId);
        if (!eligibility.isEligible()) {
            return ReportResponse.builder()
                    .eligible(false)
                    .ineligibleReason("리포트 수령 조건을 충족하지 못했습니다")
                    .build();
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다"));

        // AM 투자 정보 수집
        List<Investment> investments = investmentRepository.findByUserIdAndAmountGreaterThan(userId, 0L);
        long totalInvested = investments.stream().mapToLong(Investment::getAmount).sum();
        int investedBoothCount = investments.size();

        // AM 거래 내역만 수집 (investmentHistory only)
        long amTradeCount = investmentHistoryRepository.countByUserId(userId);
        long amWithdrawCount = investmentHistoryRepository.countByUserIdAndType(userId, InvestmentHistory.InvestmentType.WITHDRAW);

        // 새 메트릭: 아이디어 참여도 (develop zone 댓글 수)
        long ideaCount = stockCommentRepository.countByUserId(userId);

        // 새 메트릭: 별점 평가 평균점수 (1.0~5.0 스케일)
        Double ratingAvg = stockRatingRepository.getAverageScoreByUserId(userId);
        double ratingAverage = ratingAvg != null ? ratingAvg : 0.0;

        // 메트릭 계산
        double diversification = (investedBoothCount / (double) TOTAL_BOOTH_COUNT) * 100;
        double volatility = amTradeCount > 0 ? (amWithdrawCount / (double) amTradeCount) * 100 : 0;

        // 레이더 차트 점수 (0~100)
        int diversity = (int) Math.min(diversification, 100);
        int activeness = (int) Math.min(amTradeCount / 20.0 * 100, 100);
        int stability = (int) Math.max(100 - volatility, 0);
        int creativity = (int) Math.min(ideaCount / 8.0 * 100, 100);
        int insight = (int) Math.min(ratingAverage / 5.0 * 100, 100);

        // 성향 분류
        TendencyType tendency = classifyTendency(diversification, amTradeCount, volatility, ideaCount, ratingAverage);

        // 포트폴리오 데이터
        List<ReportResponse.PortfolioItem> portfolio = investments.stream()
                .sorted(Comparator.comparingLong(Investment::getAmount).reversed())
                .map(inv -> ReportResponse.PortfolioItem.builder()
                        .boothId(inv.getBooth().getId())
                        .boothName(inv.getBooth().getName())
                        .logoEmoji(inv.getBooth().getLogoEmoji())
                        .themeColor(inv.getBooth().getThemeColor())
                        .amount(inv.getAmount())
                        .percentage(totalInvested > 0 ? Math.round(inv.getAmount() / (double) totalInvested * 1000) / 10.0 : 0)
                        .build())
                .toList();

        // 최대 투자 부스
        Investment topInvestment = investments.stream()
                .max(Comparator.comparingLong(Investment::getAmount))
                .orElse(null);

        return ReportResponse.builder()
                .eligible(true)
                .userName(user.getName())
                .userCompany(user.getCompany())
                .tendencyType(tendency.name())
                .tendencyName(tendency.getKoreanName())
                .tendencyEmoji(tendency.getEmoji())
                .tendencyOneLiner(tendency.getOneLiner())
                .diversity(diversity)
                .activeness(activeness)
                .stability(stability)
                .creativity(creativity)
                .insight(insight)
                .totalInvested(totalInvested)
                .currentBalance(user.getBalance())
                .investedBoothCount(investedBoothCount)
                .totalTradeCount((int) amTradeCount)
                .ideaCount((int) ideaCount)
                .ratingAverage(Math.round(ratingAverage * 10) / 10.0)
                .portfolio(portfolio)
                .topBoothName(topInvestment != null ? topInvestment.getBooth().getName() : null)
                .topBoothEmoji(topInvestment != null ? topInvestment.getBooth().getLogoEmoji() : null)
                .topBoothAmount(topInvestment != null ? topInvestment.getAmount() : 0)
                .build();
    }

    @Transactional
    public void shareReport(Long userId, String vision) {
        if (sharedReportRepository.existsByUserId(userId)) {
            throw new IllegalStateException("이미 리포트를 공유했습니다");
        }

        ReportResponse report = generateReport(userId);
        if (!report.isEligible()) {
            throw new IllegalStateException("리포트 수령 조건을 충족하지 못했습니다");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다"));

        SharedReport sharedReport = SharedReport.builder()
                .user(user)
                .vision(vision)
                .tendencyType(report.getTendencyType())
                .tendencyName(report.getTendencyName())
                .tendencyEmoji(report.getTendencyEmoji())
                .tendencyOneLiner(report.getTendencyOneLiner())
                .build();

        sharedReportRepository.save(sharedReport);
    }

    @Transactional(readOnly = true)
    public boolean isShared(Long userId) {
        return sharedReportRepository.existsByUserId(userId);
    }

    @Transactional(readOnly = true)
    public List<SharedReportResponse> getSharedReports() {
        return sharedReportRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(sr -> SharedReportResponse.builder()
                        .userId(sr.getUser().getId())
                        .userName(sr.getUser().getName())
                        .userCompany(sr.getUser().getCompany())
                        .tendencyType(sr.getTendencyType())
                        .tendencyName(sr.getTendencyName())
                        .tendencyEmoji(sr.getTendencyEmoji())
                        .tendencyOneLiner(sr.getTendencyOneLiner())
                        .vision(sr.getVision())
                        .createdAt(sr.getCreatedAt())
                        .build())
                .toList();
    }

    /**
     * 성향 분류 알고리즘 (우선순위 매칭)
     *
     * CREATOR 크리에이터: 아이디어≥5 & 평가평균≥3.5
     * ADVENTURER 모험가: 활동≥15 & 변심도≥40
     * ANALYST 분석가: 분산도≥70 & 평가평균≥3.0
     * INFLUENCER 인플루언서: 아이디어≥3 & 활동≥10
     * SNIPER 저격수: 분산도<40 & 변심도<20
     * BUTTERFLY 나비 투자자: 분산도≥80
     * OBSERVER 관찰자: 활동<5 & 아이디어<2
     * BALANCED 균형 투자자: 기본값
     */
    private TendencyType classifyTendency(double diversification, long activity,
                                           double volatility, long ideaCount, double ratingAvg) {
        if (ideaCount >= 5 && ratingAvg >= 3.5) return TendencyType.CREATOR;
        if (activity >= 15 && volatility >= 40) return TendencyType.ADVENTURER;
        if (diversification >= 70 && ratingAvg >= 3.0) return TendencyType.ANALYST;
        if (ideaCount >= 3 && activity >= 10) return TendencyType.INFLUENCER;
        if (diversification < 40 && volatility < 20) return TendencyType.SNIPER;
        if (diversification >= 80) return TendencyType.BUTTERFLY;
        if (activity < 5 && ideaCount < 2) return TendencyType.OBSERVER;
        return TendencyType.BALANCED;
    }

    @Getter
    @RequiredArgsConstructor
    private enum TendencyType {
        CREATOR("크리에이터", "\uD83C\uDFA8", "아이디어와 평가 모두 적극적으로 참여하는 창의적 참여자"),
        ADVENTURER("모험가", "\uD83D\uDE80", "과감한 결단과 빠른 전환이 특기인 도전자"),
        ANALYST("분석가", "\uD83D\uDD2C", "넓게 분산하며 꼼꼼히 평가하는 전략가"),
        INFLUENCER("인플루언서", "\uD83D\uDCA1", "적극적으로 의견을 나누고 투자도 활발한 영향력자"),
        SNIPER("저격수", "\uD83C\uDFAF", "소수 정예에 집중하여 흔들림 없이 투자하는 달인"),
        BUTTERFLY("나비 투자자", "\uD83E\uDD8B", "다양한 가능성에 골고루 기회를 주는 탐험가"),
        OBSERVER("관찰자", "\uD83D\uDC41\uFE0F", "신중하게 관찰하며 때를 기다리는 현명한 투자자"),
        BALANCED("균형 투자자", "\u2696\uFE0F", "균형 잡힌 시각으로 안정적 포트폴리오를 구축하는 투자자");

        private final String koreanName;
        private final String emoji;
        private final String oneLiner;
    }
}
