package com.pm.investment.service;

import com.pm.investment.entity.AppSetting;
import com.pm.investment.repository.AppSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Map;

// 단순 단건 조회(findById)는 @Transactional 없이 사용 — 커넥션을 즉시 반환하여 풀 고갈 방지

@Service
@RequiredArgsConstructor
public class SettingService {

    private static final String RESULTS_REVEALED_KEY = "results_revealed";
    private static final String INVESTMENT_ENABLED_KEY = "investment_enabled";
    private static final String ANNOUNCEMENT_MESSAGE_KEY = "announcement_message";
    private static final String ANNOUNCEMENT_UPDATED_AT_KEY = "announcement_updated_at";

    private final AppSettingRepository appSettingRepository;

    public boolean isResultsRevealed() {
        return appSettingRepository.findById(RESULTS_REVEALED_KEY)
                .map(s -> "true".equals(s.getValue()))
                .orElse(false);
    }

    @Transactional
    public boolean toggleResults() {
        AppSetting setting = appSettingRepository.findById(RESULTS_REVEALED_KEY)
                .orElseGet(() -> {
                    AppSetting newSetting = new AppSetting(RESULTS_REVEALED_KEY, "false");
                    return appSettingRepository.save(newSetting);
                });

        boolean newValue = !"true".equals(setting.getValue());
        setting.setValue(String.valueOf(newValue));
        appSettingRepository.save(setting);
        return newValue;
    }

    public boolean isInvestmentEnabled() {
        return appSettingRepository.findById(INVESTMENT_ENABLED_KEY)
                .map(s -> "true".equals(s.getValue()))
                .orElse(true);
    }

    @Transactional
    public boolean toggleInvestment() {
        AppSetting setting = appSettingRepository.findById(INVESTMENT_ENABLED_KEY)
                .orElseGet(() -> {
                    AppSetting newSetting = new AppSetting(INVESTMENT_ENABLED_KEY, "true");
                    return appSettingRepository.save(newSetting);
                });

        boolean newValue = !"true".equals(setting.getValue());
        setting.setValue(String.valueOf(newValue));
        appSettingRepository.save(setting);
        return newValue;
    }

    public Map<String, String> getAnnouncement() {
        String message = appSettingRepository.findById(ANNOUNCEMENT_MESSAGE_KEY)
                .map(AppSetting::getValue)
                .orElse(null);
        String updatedAt = appSettingRepository.findById(ANNOUNCEMENT_UPDATED_AT_KEY)
                .map(AppSetting::getValue)
                .orElse(null);
        return Map.of(
                "message", message != null ? message : "",
                "updatedAt", updatedAt != null ? updatedAt : ""
        );
    }

    @Transactional
    public Map<String, String> setAnnouncement(String message) {
        if (message == null || message.isBlank()) {
            throw new IllegalArgumentException("공지 메시지는 비어있을 수 없습니다.");
        }
        if (message.length() > 200) {
            throw new IllegalArgumentException("공지 메시지는 200자를 초과할 수 없습니다.");
        }

        String now = Instant.now().toString();

        AppSetting msgSetting = appSettingRepository.findById(ANNOUNCEMENT_MESSAGE_KEY)
                .orElse(new AppSetting(ANNOUNCEMENT_MESSAGE_KEY, ""));
        msgSetting.setValue(message);
        appSettingRepository.save(msgSetting);

        AppSetting timeSetting = appSettingRepository.findById(ANNOUNCEMENT_UPDATED_AT_KEY)
                .orElse(new AppSetting(ANNOUNCEMENT_UPDATED_AT_KEY, ""));
        timeSetting.setValue(now);
        appSettingRepository.save(timeSetting);

        return Map.of("message", message, "updatedAt", now);
    }

    @Transactional
    public void clearAnnouncement() {
        appSettingRepository.deleteById(ANNOUNCEMENT_MESSAGE_KEY);
        appSettingRepository.deleteById(ANNOUNCEMENT_UPDATED_AT_KEY);
    }
}
