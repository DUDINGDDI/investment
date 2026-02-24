package com.pm.investment.service;

import com.pm.investment.dto.BoothVisitResponse;
import com.pm.investment.entity.Booth;
import com.pm.investment.entity.BoothVisit;
import com.pm.investment.entity.User;
import com.pm.investment.repository.BoothRepository;
import com.pm.investment.repository.BoothVisitRepository;
import com.pm.investment.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BoothVisitService {

    private final UserRepository userRepository;
    private final BoothRepository boothRepository;
    private final BoothVisitRepository boothVisitRepository;

    @Transactional
    public BoothVisitResponse visit(Long userId, String boothUuid) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다"));

        Booth booth = boothRepository.findByBoothUuid(boothUuid)
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 QR 코드입니다"));

        if (boothVisitRepository.existsByUserIdAndBoothId(userId, booth.getId())) {
            throw new IllegalStateException("이미 방문한 부스입니다");
        }

        BoothVisit visit = new BoothVisit(user, booth);
        boothVisitRepository.save(visit);

        return BoothVisitResponse.builder()
                .boothId(booth.getId())
                .boothName(booth.getName())
                .logoEmoji(booth.getLogoEmoji())
                .message(booth.getName() + " 부스 방문이 기록되었습니다")
                .build();
    }

    @Transactional(readOnly = true)
    public List<BoothVisitResponse> getMyVisits(Long userId) {
        return boothVisitRepository.findByUserIdOrderByVisitedAtDesc(userId)
                .stream()
                .map(v -> BoothVisitResponse.builder()
                        .boothId(v.getBooth().getId())
                        .boothName(v.getBooth().getName())
                        .logoEmoji(v.getBooth().getLogoEmoji())
                        .visitedAt(v.getVisitedAt())
                        .build())
                .toList();
    }
}
