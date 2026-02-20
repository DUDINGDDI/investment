package com.pm.investment.service;

import com.pm.investment.entity.AppSetting;
import com.pm.investment.repository.AppSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SettingService {

    private static final String RESULTS_REVEALED_KEY = "results_revealed";

    private final AppSettingRepository appSettingRepository;

    @Transactional(readOnly = true)
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
}
