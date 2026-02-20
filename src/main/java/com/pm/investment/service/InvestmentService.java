package com.pm.investment.service;

import com.pm.investment.dto.InvestmentHistoryResponse;
import com.pm.investment.dto.InvestmentResponse;
import com.pm.investment.entity.*;
import com.pm.investment.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InvestmentService {

    private final UserRepository userRepository;
    private final BoothRepository boothRepository;
    private final InvestmentRepository investmentRepository;
    private final InvestmentHistoryRepository investmentHistoryRepository;

    @Transactional
    public void invest(Long userId, Long boothId, Long amount) {
        validateAmount(amount);

        User user = userRepository.findByIdWithLock(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다"));

        Booth booth = boothRepository.findById(boothId)
                .orElseThrow(() -> new IllegalArgumentException("부스를 찾을 수 없습니다"));

        if (user.getBalance() < amount) {
            throw new IllegalStateException("보유 코인이 부족합니다");
        }

        Investment investment = investmentRepository.findByUserIdAndBoothIdWithLock(userId, boothId)
                .orElseGet(() -> {
                    Investment newInvestment = new Investment(user, booth);
                    return investmentRepository.save(newInvestment);
                });

        user.setBalance(user.getBalance() - amount);
        investment.setAmount(investment.getAmount() + amount);

        investmentHistoryRepository.save(
                new InvestmentHistory(user, booth, InvestmentHistory.InvestmentType.INVEST, amount, user.getBalance())
        );
    }

    @Transactional
    public void withdraw(Long userId, Long boothId, Long amount) {
        validateAmount(amount);

        User user = userRepository.findByIdWithLock(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다"));

        Booth booth = boothRepository.findById(boothId)
                .orElseThrow(() -> new IllegalArgumentException("부스를 찾을 수 없습니다"));

        Investment investment = investmentRepository.findByUserIdAndBoothIdWithLock(userId, boothId)
                .orElseThrow(() -> new IllegalStateException("해당 부스에 투자한 내역이 없습니다"));

        if (investment.getAmount() < amount) {
            throw new IllegalStateException("철회 금액이 투자 금액을 초과합니다");
        }

        user.setBalance(user.getBalance() + amount);
        investment.setAmount(investment.getAmount() - amount);

        investmentHistoryRepository.save(
                new InvestmentHistory(user, booth, InvestmentHistory.InvestmentType.WITHDRAW, amount, user.getBalance())
        );
    }

    @Transactional(readOnly = true)
    public List<InvestmentResponse> getMyInvestments(Long userId) {
        return investmentRepository.findByUserIdAndAmountGreaterThan(userId, 0L)
                .stream()
                .map(inv -> InvestmentResponse.builder()
                        .boothId(inv.getBooth().getId())
                        .boothName(inv.getBooth().getName())
                        .logoEmoji(inv.getBooth().getLogoEmoji())
                        .themeColor(inv.getBooth().getThemeColor())
                        .amount(inv.getAmount())
                        .build())
                .toList();
    }

    @Transactional(readOnly = true)
    public List<InvestmentHistoryResponse> getMyHistory(Long userId) {
        return investmentHistoryRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(h -> InvestmentHistoryResponse.builder()
                        .id(h.getId())
                        .boothId(h.getBooth().getId())
                        .boothName(h.getBooth().getName())
                        .logoEmoji(h.getBooth().getLogoEmoji())
                        .themeColor(h.getBooth().getThemeColor())
                        .type(h.getType().name())
                        .amount(h.getAmount())
                        .balanceAfter(h.getBalanceAfter())
                        .createdAt(h.getCreatedAt())
                        .build())
                .toList();
    }

    private void validateAmount(Long amount) {
        if (amount == null || amount <= 0) {
            throw new IllegalArgumentException("금액은 0보다 커야 합니다");
        }
        if (amount % 10_000 != 0) {
            throw new IllegalArgumentException("금액은 10,000 코인 단위여야 합니다");
        }
    }
}
