package com.pm.investment.concurrency;

import com.pm.investment.entity.*;
import com.pm.investment.repository.*;
import com.pm.investment.service.MissionService;
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
 * 미션 동시성 테스트
 *
 * 검증 대상:
 * - 미션 진행도 동시 업데이트 시 UserMission 중복 생성
 * - Renew 미션 동시 완료 시 보상(1억) 중복 지급
 * - Together 미션 동시 완료 시 중복 완료 방지
 * - 티켓 동시 사용 시 중복 사용 방지
 */
@SpringBootTest
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class MissionConcurrencyTest {

    @Autowired private MissionService missionService;
    @Autowired private UserMissionRepository userMissionRepository;
    @Autowired private StockAccountRepository stockAccountRepository;
    @Autowired private UserRepository userRepository;

    private Long userId;
    private static final String RENEW_UUID = "b2c3d4e5-f6a7-8901-bcde-f12345678901";
    private static final String TOGETHER_UUID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

    @BeforeEach
    void setUp() {
        // data.sql 시드 데이터 기준으로 userId 설정
    }

    @Test
    @DisplayName("미션 진행도 동시 업데이트 — UserMission 중복 생성 방지")
    void concurrentUpdateProgress_noDuplicateUserMission() throws InterruptedException {
        // Given: 아직 "dream" 미션 기록이 없는 사용자에게 동시에 진행도 업데이트
        String missionId = "dream";
        int threadCount = 10;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch readyLatch = new CountDownLatch(threadCount);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch doneLatch = new CountDownLatch(threadCount);
        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger failCount = new AtomicInteger(0);
        List<String> errors = new ArrayList<>();

        for (int i = 0; i < threadCount; i++) {
            final int progress = i + 1;
            executor.submit(() -> {
                try {
                    readyLatch.countDown();
                    startLatch.await();
                    missionService.updateProgress(userId, missionId, progress);
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

        // Then: UserMission 레코드는 정확히 1개
        long missionCount = userMissionRepository.findByUser_Id(userId).stream()
                .filter(um -> missionId.equals(um.getMissionId()))
                .count();

        assertThat(missionCount)
                .as("UserMission 중복 생성 방지 — %s 미션", missionId)
                .isEqualTo(1);

        System.out.printf("성공: %d, 실패: %d, 에러: %s%n",
                successCount.get(), failCount.get(), errors);
    }

    @Test
    @DisplayName("Renew 미션 동시 완료 — 보상(1억) 중복 지급 방지")
    void concurrentRenewMission_noDoubleReward() throws InterruptedException {
        // Given: 동일 사용자가 동시에 Renew 미션 완료 요청
        // 기대: 보상 1억은 정확히 1번만 지급
        long initialBalance = stockAccountRepository.findByUserId(userId)
                .map(StockAccount::getBalance)
                .orElse(100_000_000L);

        int threadCount = 5;
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
                    missionService.completeRenewMission(userId, RENEW_UUID);
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

        // Then: 잔액은 정확히 initialBalance + 1억이어야 함 (1회만 지급)
        StockAccount account = stockAccountRepository.findByUserId(userId).orElseThrow();
        long expectedBalance = initialBalance + 100_000_000L;

        assertThat(account.getBalance())
                .as("Renew 보상 중복 지급 방지: 성공 %d건이지만 보상은 1회만", successCount.get())
                .isEqualTo(expectedBalance);

        // 성공 건수도 정확히 1건이어야 함
        assertThat(successCount.get())
                .as("Renew 미션 완료는 정확히 1회만 성공")
                .isEqualTo(1);

        System.out.printf("성공: %d, 실패: %d, 최종 잔액: %d%n",
                successCount.get(), failCount.get(), account.getBalance());
    }

    @Test
    @DisplayName("Together 미션 동시 완료 — 중복 완료 방지")
    void concurrentTogetherMission_noDoubleComplete() throws InterruptedException {
        int threadCount = 5;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch readyLatch = new CountDownLatch(threadCount);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch doneLatch = new CountDownLatch(threadCount);
        AtomicInteger successCount = new AtomicInteger(0);

        for (int i = 0; i < threadCount; i++) {
            executor.submit(() -> {
                try {
                    readyLatch.countDown();
                    startLatch.await();
                    missionService.completeTogetherMission(userId, TOGETHER_UUID);
                    successCount.incrementAndGet();
                } catch (Exception e) {
                    // "이미 완료한 미션입니다" 예외 기대
                } finally {
                    doneLatch.countDown();
                }
            });
        }

        readyLatch.await();
        startLatch.countDown();
        doneLatch.await();
        executor.shutdown();

        // Then: 미션은 정확히 1번만 완료
        long completedCount = userMissionRepository.findByUser_Id(userId).stream()
                .filter(um -> "together".equals(um.getMissionId()) && um.getIsCompleted())
                .count();

        assertThat(completedCount)
                .as("Together 미션 중복 완료 방지")
                .isLessThanOrEqualTo(1);

        System.out.printf("성공: %d건%n", successCount.get());
    }

    @Test
    @DisplayName("티켓 동시 사용 — 중복 사용 방지")
    void concurrentTicketUse_noDoubleUse() throws InterruptedException {
        // Given: 완료된 미션의 티켓을 동시에 사용 시도
        // 먼저 미션 완료시키기
        missionService.completeMission(userId, "dream");

        int threadCount = 5;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch readyLatch = new CountDownLatch(threadCount);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch doneLatch = new CountDownLatch(threadCount);
        AtomicInteger successCount = new AtomicInteger(0);

        for (int i = 0; i < threadCount; i++) {
            executor.submit(() -> {
                try {
                    readyLatch.countDown();
                    startLatch.await();
                    missionService.useTicket(userId, "dream");
                    successCount.incrementAndGet();
                } catch (Exception e) {
                    // "이미 사용된 이용권입니다" 예외 기대
                } finally {
                    doneLatch.countDown();
                }
            });
        }

        readyLatch.await();
        startLatch.countDown();
        doneLatch.await();
        executor.shutdown();

        // Then: 티켓 사용은 정확히 1번만 성공해야 함
        assertThat(successCount.get())
                .as("티켓 중복 사용 방지")
                .isEqualTo(1);
    }
}
