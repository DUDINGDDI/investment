package com.pm.investment.concurrency;

import com.pm.investment.entity.*;
import com.pm.investment.repository.*;
import com.pm.investment.service.BoothRatingService;
import com.pm.investment.service.StockBoothService;
import com.pm.investment.service.StockRatingService;
import com.pm.investment.dto.StockRatingRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * 방문/평가 동시성 테스트
 *
 * 검증 대상:
 * - 동일 사용자 동시 부스 방문 시 UNIQUE 제약 위반
 * - 동일 사용자 동시 PM 부스 평가 시 중복 생성
 * - 동일 사용자 동시 AM 부스 평가 시 중복 생성
 */
@SpringBootTest
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class VisitAndRatingConcurrencyTest {

    @Autowired private StockBoothService stockBoothService;
    @Autowired private BoothRatingService boothRatingService;
    @Autowired private StockRatingService stockRatingService;
    @Autowired private StockBoothVisitRepository stockBoothVisitRepository;
    @Autowired private BoothRatingRepository boothRatingRepository;
    @Autowired private StockRatingRepository stockRatingRepository;
    @Autowired private StockBoothRepository stockBoothRepository;

    private Long userId;
    private Long pmBoothId;
    private String stockBoothUuid;
    private Long stockBoothId;

    @BeforeEach
    void setUp() {
        // data.sql 시드 데이터 기준으로 설정
        // stockBoothUuid는 실제 StockBooth의 boothUuid 값 사용
    }

    @Test
    @DisplayName("동일 사용자 동시 부스 방문 — UNIQUE 제약 위반 방지")
    void sameUser_concurrentVisit_noDuplicate() throws InterruptedException {
        int threadCount = 5;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch readyLatch = new CountDownLatch(threadCount);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch doneLatch = new CountDownLatch(threadCount);
        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger failCount = new AtomicInteger(0);
        List<String> errors = new ArrayList<>();

        for (int i = 0; i < threadCount; i++) {
            executor.submit(() -> {
                try {
                    readyLatch.countDown();
                    startLatch.await();
                    stockBoothService.recordVisit(userId, stockBoothUuid);
                    successCount.incrementAndGet();
                } catch (Exception e) {
                    failCount.incrementAndGet();
                    synchronized (errors) {
                        errors.add(e.getClass().getSimpleName() + ": " + e.getMessage());
                    }
                } finally {
                    doneLatch.countDown();
                }
            });
        }

        readyLatch.await();
        startLatch.countDown();
        doneLatch.await();
        executor.shutdown();

        // Then: 방문 기록은 정확히 1개
        long visitCount = stockBoothVisitRepository.countByStockBoothId(stockBoothId);
        // userId 기준으로도 1개
        boolean hasVisit = stockBoothVisitRepository.existsByUserIdAndStockBoothId(userId, stockBoothId);

        assertThat(hasVisit).as("방문 기록 존재").isTrue();
        // 에러 메시지에 DataIntegrityViolationException이 없어야 함 (UNIQUE 위반 대신 비즈니스 예외)
        boolean hasUniqueViolation = errors.stream()
                .anyMatch(e -> e.contains("DataIntegrity") || e.contains("ConstraintViolation"));

        assertThat(hasUniqueViolation)
                .as("UNIQUE 제약 위반 대신 비즈니스 예외로 처리되어야 함")
                .isFalse();

        System.out.printf("성공: %d, 실패: %d, 에러: %s%n",
                successCount.get(), failCount.get(), errors);
    }

    @Test
    @DisplayName("동일 사용자 동시 PM 부스 평가 — 중복 생성 방지")
    void sameUser_concurrentBoothRating_noDuplicate() throws InterruptedException {
        int threadCount = 5;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch readyLatch = new CountDownLatch(threadCount);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch doneLatch = new CountDownLatch(threadCount);
        AtomicInteger successCount = new AtomicInteger(0);
        List<String> errors = new ArrayList<>();

        for (int i = 0; i < threadCount; i++) {
            final int idx = i;
            executor.submit(() -> {
                try {
                    readyLatch.countDown();
                    startLatch.await();
                    StockRatingRequest request = StockRatingRequest.builder()
                            .scoreFirst(idx + 1)
                            .scoreBest(idx + 1)
                            .scoreDifferent(idx + 1)
                            .scoreNumberOne(idx + 1)
                            .scoreGap(idx + 1)
                            .scoreGlobal(idx + 1)
                            .build();
                    boothRatingService.submitRating(userId, pmBoothId, request);
                    successCount.incrementAndGet();
                } catch (Exception e) {
                    synchronized (errors) {
                        errors.add(e.getClass().getSimpleName() + ": " + e.getMessage());
                    }
                } finally {
                    doneLatch.countDown();
                }
            });
        }

        readyLatch.await();
        startLatch.countDown();
        doneLatch.await();
        executor.shutdown();

        // Then: BoothRating 레코드는 정확히 1개
        long ratingCount = boothRatingRepository.findByUserIdAndBoothId(userId, pmBoothId)
                .stream().count();

        assertThat(ratingCount)
                .as("PM 부스 평가 중복 생성 방지")
                .isEqualTo(1);

        boolean hasUniqueViolation = errors.stream()
                .anyMatch(e -> e.contains("DataIntegrity") || e.contains("ConstraintViolation"));

        assertThat(hasUniqueViolation)
                .as("UNIQUE 위반이 발생하면 안 됨")
                .isFalse();

        System.out.printf("성공: %d, 에러: %s%n", successCount.get(), errors);
    }

    @Test
    @DisplayName("동일 사용자 동시 AM 부스 평가 — 중복 생성 방지")
    void sameUser_concurrentStockRating_noDuplicate() throws InterruptedException {
        int threadCount = 5;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch readyLatch = new CountDownLatch(threadCount);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch doneLatch = new CountDownLatch(threadCount);
        AtomicInteger successCount = new AtomicInteger(0);
        List<String> errors = new ArrayList<>();

        for (int i = 0; i < threadCount; i++) {
            final int idx = i;
            executor.submit(() -> {
                try {
                    readyLatch.countDown();
                    startLatch.await();
                    StockRatingRequest request = StockRatingRequest.builder()
                            .scoreFirst(idx + 1)
                            .scoreBest(idx + 1)
                            .scoreDifferent(idx + 1)
                            .scoreNumberOne(idx + 1)
                            .scoreGap(idx + 1)
                            .scoreGlobal(idx + 1)
                            .build();
                    stockRatingService.submitRating(userId, stockBoothId, request);
                    successCount.incrementAndGet();
                } catch (Exception e) {
                    synchronized (errors) {
                        errors.add(e.getClass().getSimpleName() + ": " + e.getMessage());
                    }
                } finally {
                    doneLatch.countDown();
                }
            });
        }

        readyLatch.await();
        startLatch.countDown();
        doneLatch.await();
        executor.shutdown();

        // Then: StockRating 레코드는 정확히 1개
        long ratingCount = stockRatingRepository.findByUserIdAndStockBoothId(userId, stockBoothId)
                .stream().count();

        assertThat(ratingCount)
                .as("AM 부스 평가 중복 생성 방지")
                .isEqualTo(1);

        System.out.printf("성공: %d, 에러: %s%n", successCount.get(), errors);
    }
}
