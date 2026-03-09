package com.pm.investment.concurrency;

import com.pm.investment.entity.*;
import com.pm.investment.repository.*;
import com.pm.investment.service.InvestmentService;
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
 * PM 투자/철회 동시성 테스트
 *
 * 검증 대상:
 * - 동일 사용자가 동시에 여러 투자를 수행할 때 잔액 정합성
 * - 동일 사용자가 동시에 투자+철회를 수행할 때 잔액 정합성
 * - 여러 사용자가 동시에 같은 부스에 투자할 때 데이터 정합성
 * - 첫 투자 시 Investment 레코드 동시 생성 (UNIQUE 제약 위반)
 */
@SpringBootTest
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class InvestmentConcurrencyTest {

    @Autowired private InvestmentService investmentService;
    @Autowired private UserRepository userRepository;
    @Autowired private BoothRepository boothRepository;
    @Autowired private InvestmentRepository investmentRepository;
    @Autowired private BoothRatingRepository boothRatingRepository;
    @Autowired private AppSettingRepository appSettingRepository;

    private Long userId;
    private Long boothId;
    private static final Long INVEST_AMOUNT = 5_000_000L;
    private static final Long INITIAL_BALANCE = 100_000_000L;

    @BeforeEach
    void setUp() {
        // 테스트 데이터는 data.sql에 의해 자동 시드됨
        // 필요한 경우 여기서 추가 설정
        // 투자 활성화 설정
        AppSetting setting = appSettingRepository.findById("investment_enabled")
                .orElse(new AppSetting("investment_enabled", "true"));
        setting.setValue("true");
        appSettingRepository.save(setting);
    }

    @Test
    @DisplayName("동일 사용자 동시 투자 — 잔액 정합성 검증")
    void sameUser_concurrentInvest_balanceConsistency() throws InterruptedException {
        // Given: 사용자 1명, 잔액 1억, 500만원씩 10번 동시 투자
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
                    readyLatch.countDown();  // 준비 완료 신호
                    startLatch.await();      // 동시 시작 대기
                    investmentService.invest(userId, boothId, INVEST_AMOUNT);
                    successCount.incrementAndGet();
                } catch (Exception e) {
                    failCount.incrementAndGet();
                } finally {
                    doneLatch.countDown();
                }
            });
        }

        readyLatch.await();   // 모든 스레드 준비 대기
        startLatch.countDown(); // 동시 시작
        doneLatch.await();    // 모든 스레드 완료 대기
        executor.shutdown();

        // Then: 잔액 = 초기잔액 - (성공횟수 × 투자금액)
        User user = userRepository.findById(userId).orElseThrow();
        long expectedBalance = INITIAL_BALANCE - (successCount.get() * INVEST_AMOUNT);

        assertThat(user.getBalance())
                .as("잔액 정합성: 초기 %d - (%d건 × %d) = %d",
                        INITIAL_BALANCE, successCount.get(), INVEST_AMOUNT, expectedBalance)
                .isEqualTo(expectedBalance);

        System.out.printf("성공: %d, 실패: %d, 최종 잔액: %d%n",
                successCount.get(), failCount.get(), user.getBalance());
    }

    @Test
    @DisplayName("동일 사용자 동시 투자+철회 혼합 — 잔액 정합성 검증")
    void sameUser_concurrentInvestAndWithdraw_balanceConsistency() throws InterruptedException {
        // Given: 먼저 5000만원 투자 (철회할 수 있도록)
        // 이후 투자 5번 + 철회 5번 동시 수행
        int investCount = 5;
        int withdrawCount = 5;
        int totalThreads = investCount + withdrawCount;

        ExecutorService executor = Executors.newFixedThreadPool(totalThreads);
        CountDownLatch readyLatch = new CountDownLatch(totalThreads);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch doneLatch = new CountDownLatch(totalThreads);
        AtomicInteger investSuccess = new AtomicInteger(0);
        AtomicInteger withdrawSuccess = new AtomicInteger(0);
        List<String> errors = new ArrayList<>();

        // 투자 스레드
        for (int i = 0; i < investCount; i++) {
            executor.submit(() -> {
                try {
                    readyLatch.countDown();
                    startLatch.await();
                    investmentService.invest(userId, boothId, INVEST_AMOUNT);
                    investSuccess.incrementAndGet();
                } catch (Exception e) {
                    synchronized (errors) { errors.add("투자: " + e.getMessage()); }
                } finally {
                    doneLatch.countDown();
                }
            });
        }

        // 철회 스레드
        for (int i = 0; i < withdrawCount; i++) {
            executor.submit(() -> {
                try {
                    readyLatch.countDown();
                    startLatch.await();
                    investmentService.withdraw(userId, boothId, INVEST_AMOUNT);
                    withdrawSuccess.incrementAndGet();
                } catch (Exception e) {
                    synchronized (errors) { errors.add("철회: " + e.getMessage()); }
                } finally {
                    doneLatch.countDown();
                }
            });
        }

        readyLatch.await();
        startLatch.countDown();
        doneLatch.await();
        executor.shutdown();

        // Then: 잔액 정합성 검증
        User user = userRepository.findById(userId).orElseThrow();
        long netChange = (investSuccess.get() - withdrawSuccess.get()) * INVEST_AMOUNT;
        long expectedBalance = INITIAL_BALANCE - netChange;

        assertThat(user.getBalance())
                .as("혼합 정합성: 투자 %d건, 철회 %d건", investSuccess.get(), withdrawSuccess.get())
                .isEqualTo(expectedBalance);

        System.out.printf("투자 성공: %d, 철회 성공: %d, 에러: %s%n",
                investSuccess.get(), withdrawSuccess.get(), errors);
    }

    @Test
    @DisplayName("여러 사용자가 동일 부스에 동시 투자 — 총 투자금 정합성")
    void multipleUsers_sameBoothInvest_totalConsistency() throws InterruptedException {
        // Given: N명의 사용자가 동일 부스에 동시 투자
        List<Long> userIds = userRepository.findAll().stream()
                .map(User::getId)
                .limit(10)
                .toList();

        int threadCount = userIds.size();
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch readyLatch = new CountDownLatch(threadCount);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch doneLatch = new CountDownLatch(threadCount);
        AtomicInteger successCount = new AtomicInteger(0);

        for (Long uid : userIds) {
            executor.submit(() -> {
                try {
                    readyLatch.countDown();
                    startLatch.await();
                    investmentService.invest(uid, boothId, INVEST_AMOUNT);
                    successCount.incrementAndGet();
                } catch (Exception e) {
                    // 평가 미완료 등의 사유로 실패 가능
                } finally {
                    doneLatch.countDown();
                }
            });
        }

        readyLatch.await();
        startLatch.countDown();
        doneLatch.await();
        executor.shutdown();

        // Then: 부스 총 투자금 = 성공 건수 × 투자 단위
        long totalInvestment = investmentRepository.findByBoothId(boothId)
                .stream()
                .mapToLong(Investment::getAmount)
                .sum();

        assertThat(totalInvestment)
                .as("부스 총 투자금 정합성")
                .isEqualTo(successCount.get() * INVEST_AMOUNT);
    }

    @Test
    @DisplayName("동일 사용자 첫 투자 동시 요청 — UNIQUE 제약 위반 검증")
    void sameUser_firstInvest_duplicateCreation() throws InterruptedException {
        // Given: 아직 해당 부스에 투자한 적 없는 사용자
        // 동시에 2개 스레드가 첫 투자를 시도 → Investment 중복 생성 위험
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
                    investmentService.invest(userId, boothId, INVEST_AMOUNT);
                    successCount.incrementAndGet();
                } catch (Exception e) {
                    failCount.incrementAndGet();
                    synchronized (errors) { errors.add(e.getClass().getSimpleName() + ": " + e.getMessage()); }
                } finally {
                    doneLatch.countDown();
                }
            });
        }

        readyLatch.await();
        startLatch.countDown();
        doneLatch.await();
        executor.shutdown();

        // Then: Investment 레코드는 정확히 1개만 존재해야 함
        long investmentCount = investmentRepository.findByUserIdAndBoothId(userId, boothId)
                .stream().count();

        assertThat(investmentCount)
                .as("Investment 레코드 중복 생성 방지")
                .isEqualTo(1);

        System.out.printf("성공: %d, 실패: %d, 에러: %s%n",
                successCount.get(), failCount.get(), errors);
    }
}
