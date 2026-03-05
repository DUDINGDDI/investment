package com.pm.investment.service;

import com.pm.investment.dto.MyStockBoothVisitorResponse;
import com.pm.investment.dto.MyStockVisitResponse;
import com.pm.investment.dto.StockBoothResponse;
import com.pm.investment.dto.StockBoothVisitResponse;
import com.pm.investment.entity.StockBooth;
import com.pm.investment.entity.StockBoothVisit;
import com.pm.investment.entity.User;
import com.pm.investment.repository.StockBoothRepository;
import com.pm.investment.repository.StockBoothVisitRepository;
import com.pm.investment.repository.StockHoldingRepository;
import com.pm.investment.repository.StockRatingRepository;
import com.pm.investment.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StockBoothService {

    private final StockBoothRepository stockBoothRepository;
    private final StockHoldingRepository stockHoldingRepository;
    private final StockBoothVisitRepository stockBoothVisitRepository;
    private final StockRatingRepository stockRatingRepository;
    private final UserRepository userRepository;
    private final MissionService missionService;

    @Transactional(readOnly = true)
    public List<StockBoothResponse> getAllStockBooths(Long userId) {
        List<StockBooth> booths = stockBoothRepository.findAllByOrderByDisplayOrderAsc();

        // 1개 쿼리로 전체 부스 보유 통계 조회 (N+1 제거)
        Map<Long, Long> totalMap = stockHoldingRepository.getTotalHoldingByAllBooths()
                .stream()
                .collect(Collectors.toMap(
                        row -> (Long) row[0],
                        row -> ((Number) row[1]).longValue()
                ));

        // 유저별 데이터 일괄 조회 (N+1 제거)
        Map<Long, Long> myMap = Map.of();
        Set<Long> visitedSet = Set.of();
        Set<Long> ratedSet = Set.of();
        if (userId != null) {
            myMap = stockHoldingRepository.getMyHoldingAmounts(userId)
                    .stream()
                    .collect(Collectors.toMap(
                            row -> (Long) row[0],
                            row -> ((Number) row[1]).longValue()
                    ));
            visitedSet = new HashSet<>(stockBoothVisitRepository.findVisitedStockBoothIdsByUserId(userId));
            ratedSet = new HashSet<>(stockRatingRepository.findRatedStockBoothIdsByUserId(userId));
        }

        final Map<Long, Long> finalMyMap = myMap;
        final Set<Long> finalVisitedSet = visitedSet;
        final Set<Long> finalRatedSet = ratedSet;

        return booths.stream().map(booth -> StockBoothResponse.builder()
                .id(booth.getId())
                .name(booth.getName())
                .category(booth.getCategory())
                .description(booth.getDescription())
                .shortDescription(booth.getShortDescription())
                .displayOrder(booth.getDisplayOrder())
                .logoEmoji(booth.getLogoEmoji())
                .themeColor(booth.getThemeColor())
                .totalHolding(totalMap.getOrDefault(booth.getId(), 0L))
                .myHolding(finalMyMap.getOrDefault(booth.getId(), 0L))
                .hasVisited(finalVisitedSet.contains(booth.getId()))
                .hasRated(finalRatedSet.contains(booth.getId()))
                .build()
        ).toList();
    }

    @Transactional(readOnly = true)
    public StockBoothResponse getStockBooth(Long boothId, Long userId) {
        StockBooth booth = stockBoothRepository.findById(boothId)
                .orElseThrow(() -> new IllegalArgumentException("부스를 찾을 수 없습니다"));

        Long totalHolding = stockHoldingRepository.getTotalHoldingByStockBoothId(boothId);
        Long myHolding = 0L;
        if (userId != null) {
            myHolding = stockHoldingRepository.findByUserIdAndStockBoothId(userId, boothId)
                    .map(sh -> sh.getAmount())
                    .orElse(0L);
        }

        return StockBoothResponse.builder()
                .id(booth.getId())
                .name(booth.getName())
                .category(booth.getCategory())
                .description(booth.getDescription())
                .shortDescription(booth.getShortDescription())
                .displayOrder(booth.getDisplayOrder())
                .logoEmoji(booth.getLogoEmoji())
                .themeColor(booth.getThemeColor())
                .totalHolding(totalHolding)
                .myHolding(myHolding)
                .hasVisited(userId != null && stockBoothVisitRepository.existsByUserIdAndStockBoothId(userId, boothId))
                .hasRated(userId != null && stockRatingRepository.existsByUserIdAndStockBoothId(userId, boothId))
                .build();
    }

    @Transactional
    public StockBoothVisitResponse recordVisit(Long userId, String boothUuid) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다"));

        StockBooth booth = stockBoothRepository.findByBoothUuid(boothUuid)
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 QR 코드입니다"));

        if (stockBoothVisitRepository.existsByUserIdAndStockBoothId(userId, booth.getId())) {
            throw new IllegalStateException("이미 방문한 부스입니다");
        }

        StockBoothVisit visit = new StockBoothVisit(user, booth);
        stockBoothVisitRepository.save(visit);

        // again 미션: 부스 소유자들의 방문자 수 업데이트
        long visitorCount = stockBoothVisitRepository.countByStockBoothId(booth.getId());
        List<User> boothOwners = userRepository.findByBelongingBooth_Name(booth.getName());
        for (User owner : boothOwners) {
            missionService.checkAndUpdateMission(owner.getId(), "again", (int) visitorCount);
        }

        return StockBoothVisitResponse.builder()
                .boothId(booth.getId())
                .boothName(booth.getName())
                .logoEmoji(booth.getLogoEmoji())
                .message(booth.getName() + " 부스 방문이 기록되었습니다")
                .build();
    }

    @Transactional(readOnly = true)
    public List<MyStockVisitResponse> getMyVisits(Long userId) {
        return stockBoothVisitRepository.findByUserIdOrderByVisitedAtDesc(userId)
                .stream()
                .map(visit -> MyStockVisitResponse.builder()
                        .boothId(visit.getStockBooth().getId())
                        .boothName(visit.getStockBooth().getName())
                        .logoEmoji(visit.getStockBooth().getLogoEmoji())
                        .visitedAt(visit.getVisitedAt())
                        .build())
                .toList();
    }

    @Transactional(readOnly = true)
    public MyStockBoothVisitorResponse getMyBoothVisitors(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다"));

        StockBooth stockBooth = user.getBelongingStockBooth();
        if (stockBooth == null) {
            return null;
        }

        return MyStockBoothVisitorResponse.builder()
                .boothName(stockBooth.getName())
                .logoEmoji(stockBooth.getLogoEmoji())
                .visitorCount(stockBoothVisitRepository.countByStockBoothId(stockBooth.getId()))
                .build();
    }
}
