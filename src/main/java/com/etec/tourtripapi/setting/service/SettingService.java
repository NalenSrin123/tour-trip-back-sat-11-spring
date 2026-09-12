package com.etec.tourtripapi.setting.service;

import com.etec.tourtripapi.setting.dto.request.SettingRequest;
import com.etec.tourtripapi.setting.dto.response.SettingResponse;

import java.util.List;

public interface SettingService {
    List<SettingResponse> getAllSettings();
    SettingResponse getSettingByKey(String key);
    SettingResponse saveOrUpdateSetting(SettingRequest request);
    void deleteSetting(Long id);
}