package com.pm.investment.service;

import com.pm.investment.dto.AdminBoothRatingResponse;
import com.pm.investment.dto.BoothReviewResponse;
import com.pm.investment.dto.StockRatingRequest;
import com.pm.investment.dto.StockRatingResponse;
import com.pm.investment.entity.Booth;
import com.pm.investment.entity.StockRating;
import com.pm.investment.entity.User;
import com.pm.investment.repository.BoothRepository;
import com.pm.investment.repository.BoothVisitRepository;
import com.pm.investment.repository.StockRatingRepository;
import com.pm.investment.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class StockRatingService {

    private final StockRatingRepository stockRatingRepository;
    private final UserRepository userRepository;
    private final BoothRepository boothRepository;
    private final BoothVisitRepository boothVisitRepository;
    private final MissionService missionService;

    @Transactional
    public StockRatingResponse submitRating(Long userId, Long boothId, StockRatingRequest request) {
        if (!boothVisitRepository.existsByUserIdAndBoothId(userId, boothId)) {
            throw new IllegalStateException("부스를 방문한 후에 평가할 수 있습니다");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다"));

        Booth booth = boothRepository.findById(boothId)
                .orElseThrow(() -> new IllegalArgumentException("부스를 찾을 수 없습니다"));

        Optional<StockRating> existing = stockRatingRepository.findByUserIdAndBoothId(userId, boothId);

        StockRating rating;
        if (existing.isPresent()) {
            rating = existing.get();
            rating.setScoreFirst(request.getScoreFirst());
            rating.setScoreBest(request.getScoreBest());
            rating.setScoreDifferent(request.getScoreDifferent());
            rating.setScoreNumberOne(request.getScoreNumberOne());
            rating.setScoreGap(request.getScoreGap());
            rating.setScoreGlobal(request.getScoreGlobal());
            rating.setReview(request.getReview());
        } else {
            rating = new StockRating(user, booth,
                    request.getScoreFirst(), request.getScoreBest(),
                    request.getScoreDifferent(), request.getScoreNumberOne(),
                    request.getScoreGap(), request.getScoreGlobal(),
                    request.getReview());
            stockRatingRepository.save(rating);
        }

        // sincere 미션 자동 달성 체크: 리뷰가 포함된 평가 수
        long reviewCount = stockRatingRepository.countByUserIdAndReviewIsNotNull(userId);
        missionService.checkAndUpdateMission(userId, "sincere", (int) reviewCount);

        return toResponse(rating);
    }

    @Transactional(readOnly = true)
    public List<BoothReviewResponse> getBoothReviews(Long boothId) {
        return stockRatingRepository.findByBoothIdAndReviewIsNotNullOrderByUpdatedAtDesc(boothId)
                .stream()
                .map(r -> BoothReviewResponse.builder()
                        .id(r.getId())
                        .userId(r.getUser().getId())
                        .userName(r.getUser().getName())
                        .review(r.getReview())
                        .updatedAt(r.getUpdatedAt())
                        .build())
                .toList();
    }

    @Transactional
    public void deleteReview(Long userId, Long boothId) {
        StockRating rating = stockRatingRepository.findByUserIdAndBoothId(userId, boothId)
                .orElseThrow(() -> new IllegalArgumentException("평가를 찾을 수 없습니다"));
        rating.setReview(null);

        // sincere 미션 진행도 재계산
        long reviewCount = stockRatingRepository.countByUserIdAndReviewIsNotNull(userId);
        missionService.checkAndUpdateMission(userId, "sincere", (int) reviewCount);
    }

    @Transactional(readOnly = true)
    public StockRatingResponse getMyRating(Long userId, Long boothId) {
        return stockRatingRepository.findByUserIdAndBoothId(userId, boothId)
                .map(this::toResponse)
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public List<AdminBoothRatingResponse> getAdminRatingResults() {
        List<Booth> booths = boothRepository.findAllByOrderByDisplayOrderAsc();
        List<Object[]> aggregates = stockRatingRepository.getBoothRatingAggregates();

        Map<Long, Object[]> aggMap = new HashMap<>();
        for (Object[] agg : aggregates) {
            aggMap.put((Long) agg[0], agg);
        }

        return booths.stream().map(booth -> {
            Object[] agg = aggMap.get(booth.getId());
            if (agg == null) {
                return AdminBoothRatingResponse.builder()
                        .boothId(booth.getId())
                        .boothName(booth.getName())
                        .logoEmoji(booth.getLogoEmoji())
                        .themeColor(booth.getThemeColor())
                        .ratingCount(0L)
                        .totalScoreSum(0L)
                        .avgFirst(0.0).avgBest(0.0).avgDifferent(0.0)
                        .avgNumberOne(0.0).avgGap(0.0).avgGlobal(0.0)
                        .avgTotal(0.0)
                        .build();
            }

            Long count = (Long) agg[1];
            Long totalSum = ((Number) agg[2]).longValue();
            Double avgFirst = (Double) agg[3];
            Double avgBest = (Double) agg[4];
            Double avgDifferent = (Double) agg[5];
            Double avgNumberOne = (Double) agg[6];
            Double avgGap = (Double) agg[7];
            Double avgGlobal = (Double) agg[8];
            Double avgTotal = count > 0 ? (double) totalSum / count : 0.0;

            return AdminBoothRatingResponse.builder()
                    .boothId(booth.getId())
                    .boothName(booth.getName())
                    .logoEmoji(booth.getLogoEmoji())
                    .themeColor(booth.getThemeColor())
                    .ratingCount(count)
                    .totalScoreSum(totalSum)
                    .avgFirst(avgFirst).avgBest(avgBest).avgDifferent(avgDifferent)
                    .avgNumberOne(avgNumberOne).avgGap(avgGap).avgGlobal(avgGlobal)
                    .avgTotal(avgTotal)
                    .build();
        }).toList();
    }

    private StockRatingResponse toResponse(StockRating r) {
        return StockRatingResponse.builder()
                .id(r.getId())
                .boothId(r.getBooth().getId())
                .scoreFirst(r.getScoreFirst())
                .scoreBest(r.getScoreBest())
                .scoreDifferent(r.getScoreDifferent())
                .scoreNumberOne(r.getScoreNumberOne())
                .scoreGap(r.getScoreGap())
                .scoreGlobal(r.getScoreGlobal())
                .totalScore(r.getTotalScore())
                .review(r.getReview())
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt())
                .build();
    }
}
