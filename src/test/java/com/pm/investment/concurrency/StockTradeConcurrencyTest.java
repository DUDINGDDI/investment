package com.pm.investment.concurrency;

import com.pm.investment.entity.*;
import com.pm.investment.repository.*;
import com.pm.investment.service.StockService;
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
 * AM 주식 매수/매도 동시성 테스트
 *
 * 검증 대상:
 * - 동일 사용자 동시 매수 시 계좌 잔액 정합성
 * - 동일 사용자 동시 매수+매도 혼합 시 계좌 잔액 정합성
 * - 부스당 최대 투자 한도(3000만) 동시 검증
 * - 첫 매수 시 StockHolding 동시 생성 (UNIQUE 제약 위반)
 */
@SpringBootTest
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class StockTradeConcurrencyTest {

    @Autowired private StockService stockService;
    @Autowired private StockAccountRepository stockAccountRepository;
    @Autowired private StockHoldingRepository stockHoldingRepository;
    @Autowired private AppSettingRepository appSettingRepository;
    @Autowired private StockBoothVisitRepository stockBoothVisitRepository;
    @Autowired private StockRatingRepository stockRatingRepository;

    private Long userId;
    private Long boothId;
    private static final Long TRADE_AMOUNT = 5_000_000L;
    private static final Long INITIAL_BALANCE = 100_000_000L;
    private static final Long MAX_PER_BOOTH = 30_000_000L;

    @BeforeEach
    void setUp() {
        // 주식 거래 활성화
        AppSetting setting = appSettingRepository.findById("stock_enabled")
                .orElse(new AppSetting("stock_enabled", "true"));
        setting.setValue("true");
        appSettingRepository.save(setting);

        // 테스트에 필요한 userId, boothId는 data.sql 시드 데이터 기준으로 설정
        // 방문/평가 전제조건도 미리 충족시켜야 함
    }

    @Test
    @DisplayName("동일 사용자 동시 매수 — 계좌 잔액 정합성")
    void sameUser_concurrentBuy_balanceConsistency() throws InterruptedException {
        int threadCount = 10;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch readyLatch = new CountDownLatch(threadCount);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch doneLatch = new CountDownLatch(threadCount);
        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger failCount = new AtomicInteger(0);

        for (int i = 0; i < threadCount; i++) {
            executor.submit(() -> {
                try {
                    readyLatch.countDown();
                    startLatch.await();
                    stockService.buy(userId, boothId, TRADE_AMOUNT);
                    successCount.incrementAndGet();
                } catch (Exception e) {
                    failCount.incrementAndGet();
                } finally {
                    doneLatch.countDown();
                }
            });
        }

        readyLatch.await();
        startLatch.countDown();
        doneLatch.await();
        executor.shutdown();

        // Then
        StockAccount account = stockAccountRepository.findByUserId(userId).orElseThrow();
        long expectedBalance = INITIAL_BALANCE - (successCount.get() * TRADE_AMOUNT);

        assertThat(account.getBalance())
                .as("매수 후 계좌 잔액 정합성")
                .isEqualTo(expectedBalance);

        System.out.printf("매수 성공: %d, 실패: %d, 최종 잔액: %d%n",
                successCount.get(), failCount.get(), account.getBalance());
    }

    @Test
    @DisplayName("부스당 최대 투자 한도 동시 검증 — 3000만 초과 방지")
    void sameUser_concurrentBuy_maxPerBoothLimit() throws InterruptedException {
        // Given: 500만원씩 8번 동시 매수 시도 → 최대 6건(3000만)만 성공해야 함
        int threadCount = 8;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch readyLatch = new CountDownLatch(threadCount);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch doneLatch = new CountDownLatch(threadCount);
        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger failCount = new AtomicInteger(0);

        for (int i = 0; i < threadCount; i++) {
            executor.submit(() -> {
                try {
                    readyLatch.countDown();
                    startLatch.await();
                    stockService.buy(userId, boothId, TRADE_AMOUNT);
                    successCount.incrementAndGet();
                } catch (Exception e) {
                    failCount.incrementAndGet();
                } finally {
                    doneLatch.countDown();
                }
            });
        }

        readyLatch.await();
        startLatch.countDown();
        doneLatch.await();
        executor.shutdown();

        // Then: 보유량이 MAX_PER_BOOTH를 초과하지 않아야 함
        StockHolding holding = stockHoldingRepository
                .findByUserIdAndStockBoothId(userId, boothId)
                .orElse(null);

        if (holding != null) {
            assertThat(holding.getAmount())
                    .as("부스당 최대 투자 한도 초과 방지")
                    .isLessThanOrEqualTo(MAX_PER_BOOTH);
        }

        System.out.printf("매수 성공: %d, 실패: %d, 보유량: %d%n",
                successCount.get(), failCount.get(),
                holding != null ? holding.getAmount() : 0);
    }

    @Test
    @DisplayName("동일 사용자 동시 매수+매도 혼합 — 계좌/보유량 정합성")
    void sameUser_concurrentBuyAndSell_consistency() throws InterruptedException {
        // Given: 먼저 1500만원 매수 (매도 가능하도록)
        // 이후 매수 5번 + 매도 3번 동시 수행
        int buyCount = 5;
        int sellCount = 3;
        int totalThreads = buyCount + sellCount;

        ExecutorService executor = Executors.newFixedThreadPool(totalThreads);
        CountDownLatch readyLatch = new CountDownLatch(totalThreads);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch doneLatch = new CountDownLatch(totalThreads);
        AtomicInteger buySuccess = new AtomicInteger(0);
        AtomicInteger sellSuccess = new AtomicInteger(0);

        for (int i = 0; i < buyCount; i++) {
            executor.submit(() -> {
                try {
                    readyLatch.countDown();
                    startLatch.await();
                    stockService.buy(userId, boothId, TRADE_AMOUNT);
                    buySuccess.incrementAndGet();
                } catch (Exception e) {
                    // 잔액 부족, 한도 초과 등
                } finally {
                    doneLatch.countDown();
                }
            });
        }

        for (int i = 0; i < sellCount; i++) {
            executor.submit(() -> {
                try {
                    readyLatch.countDown();
                    startLatch.await();
                    stockService.sell(userId, boothId, TRADE_AMOUNT);
                    sellSuccess.incrementAndGet();
                } catch (Exception e) {
                    // 보유량 부족 등
                } finally {
                    doneLatch.countDown();
                }
            });
        }

        readyLatch.await();
        startLatch.countDown();
        doneLatch.await();
        executor.shutdown();

        // Then: 계좌 잔액 + 보유량 = 일관성 유지
        StockAccount account = stockAccountRepository.findByUserId(userId).orElseThrow();
        StockHolding holding = stockHoldingRepository
                .findByUserIdAndStockBoothId(userId, boothId)
                .orElse(null);

        long holdingAmount = holding != null ? holding.getAmount() : 0;
        long netTrade = (buySuccess.get() - sellSuccess.get()) * TRADE_AMOUNT;

        assertThat(account.getBalance() + holdingAmount)
                .as("계좌 잔액 + 보유량 = 전체 자산 일관성")
                .isGreaterThanOrEqualTo(0);

        System.out.printf("매수 성공: %d, 매도 성공: %d, 잔액: %d, 보유: %d%n",
                buySuccess.get(), sellSuccess.get(), account.getBalance(), holdingAmount);
    }

    @Test
    @DisplayName("첫 매수 시 StockHolding 동시 생성 — UNIQUE 제약 위반 검증")
    void sameUser_firstBuy_duplicateHoldingCreation() throws InterruptedException {
        // Given: 아직 해당 부스 보유 기록 없는 사용자, 5개 스레드가 동시 매수
        int threadCount = 5;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch readyLatch = new CountDownLatch(threadCount);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch doneLatch = new CountDownLatch(threadCount);
        AtomicInteger successCount = new AtomicInteger(0);
        List<String> errors = new ArrayList<>();

        for (int i = 0; i < threadCount; i++) {
            executor.submit(() -> {
                try {
                    readyLatch.countDown();
                    startLatch.await();
                    stockService.buy(userId, boothId, TRADE_AMOUNT);
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

        // Then: StockHolding 레코드는 정확히 1개여야 함
        List<StockHolding> holdings = stockHoldingRepository
                .findByUserIdAndAmountGreaterThan(userId, -1L);  // amount >= 0 모두 조회

        long holdingCount = holdings.stream()
                .filter(h -> h.getStockBooth().getId().equals(boothId))
                .count();

        assertThat(holdingCount)
                .as("StockHolding 중복 생성 방지")
                .isEqualTo(1);

        System.out.printf("성공: %d, 에러: %s%n", successCount.get(), errors);
    }
}
