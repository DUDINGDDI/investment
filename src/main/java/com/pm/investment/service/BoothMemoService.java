package com.pm.investment.service;

import com.pm.investment.entity.Booth;
import com.pm.investment.entity.BoothMemo;
import com.pm.investment.entity.User;
import com.pm.investment.repository.BoothMemoRepository;
import com.pm.investment.repository.BoothRepository;
import com.pm.investment.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class BoothMemoService {

    private final BoothMemoRepository boothMemoRepository;
    private final UserRepository userRepository;
    private final BoothRepository boothRepository;

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAllMemos(Long userId) {
        return boothMemoRepository.findAllByUserIdIn(List.of(userId)).stream()
                .map(memo -> Map.<String, Object>of(
                        "boothId", memo.getBooth().getId(),
                        "boothName", memo.getBooth().getName(),
                        "content", memo.getContent()
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public String getMemo(Long userId, Long boothId) {
        return boothMemoRepository.findByUserIdAndBoothId(userId, boothId)
                .map(BoothMemo::getContent)
                .orElse(null);
    }

    @Transactional
    public void saveMemo(Long userId, Long boothId, String content) {
        if (content == null || content.isBlank()) {
            boothMemoRepository.findByUserIdAndBoothId(userId, boothId)
                    .ifPresent(boothMemoRepository::delete);
            return;
        }

        BoothMemo memo = boothMemoRepository.findByUserIdAndBoothId(userId, boothId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다"));
                    Booth booth = boothRepository.findById(boothId)
                            .orElseThrow(() -> new IllegalArgumentException("부스를 찾을 수 없습니다"));
                    return new BoothMemo(user, booth, content);
                });
        memo.setContent(content);
        boothMemoRepository.save(memo);
    }

    @Transactional
    public void deleteMemo(Long userId, Long boothId) {
        boothMemoRepository.findByUserIdAndBoothId(userId, boothId)
                .ifPresent(boothMemoRepository::delete);
    }
}
