package com.pm.investment.concurrency;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * 동시성 테스트 공통 유틸리티
 *
 * 사용법:
 * <pre>
 * ConcurrencyTestHelper.Result result = ConcurrencyTestHelper.run(10, () -> {
 *     investmentService.invest(userId, boothId, amount);
 * });
 * assertThat(result.successCount()).isEqualTo(10);
 * </pre>
 */
public class ConcurrencyTestHelper {

    /**
     * 동시성 테스트 실행 결과
     */
    public record Result(
            int successCount,
            int failCount,
            List<String> errors
    ) {}

    /**
     * threadCount 개의 스레드가 동시에 action을 실행
     *
     * @param threadCount 동시 실행할 스레드 수
     * @param action      각 스레드가 실행할 작업
     * @return 성공/실패 카운트 및 에러 메시지
     */
    public static Result run(int threadCount, Runnable action) throws InterruptedException {
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch readyLatch = new CountDownLatch(threadCount);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch doneLatch = new CountDownLatch(threadCount);
        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger failCount = new AtomicInteger(0);
        List<String> errors = Collections.synchronizedList(new ArrayList<>());

        for (int i = 0; i < threadCount; i++) {
            executor.submit(() -> {
                try {
                    readyLatch.countDown();
                    startLatch.await();
                    action.run();
                    successCount.incrementAndGet();
                } catch (Exception e) {
                    failCount.incrementAndGet();
                    errors.add(e.getClass().getSimpleName() + ": " + e.getMessage());
                } finally {
                    doneLatch.countDown();
                }
            });
        }

        readyLatch.await();
        startLatch.countDown();
        doneLatch.await();
        executor.shutdown();

        return new Result(successCount.get(), failCount.get(), errors);
    }

    /**
     * threadCount 개의 스레드가 동시에 각각 다른 action을 실행
     *
     * @param actions 각 스레드가 실행할 작업 리스트
     * @return 성공/실패 카운트 및 에러 메시지
     */
    public static Result runDifferent(List<Runnable> actions) throws InterruptedException {
        int threadCount = actions.size();
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch readyLatch = new CountDownLatch(threadCount);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch doneLatch = new CountDownLatch(threadCount);
        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger failCount = new AtomicInteger(0);
        List<String> errors = Collections.synchronizedList(new ArrayList<>());

        for (Runnable action : actions) {
            executor.submit(() -> {
                try {
                    readyLatch.countDown();
                    startLatch.await();
                    action.run();
                    successCount.incrementAndGet();
                } catch (Exception e) {
                    failCount.incrementAndGet();
                    errors.add(e.getClass().getSimpleName() + ": " + e.getMessage());
                } finally {
                    doneLatch.countDown();
                }
            });
        }

        readyLatch.await();
        startLatch.countDown();
        doneLatch.await();
        executor.shutdown();

        return new Result(successCount.get(), failCount.get(), errors);
    }
}
