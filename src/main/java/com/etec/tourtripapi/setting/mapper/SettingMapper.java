package com.etec.tourtripapi.setting.mapper;

import com.etec.tourtripapi.setting.dto.response.SettingResponse;
import com.etec.tourtripapi.setting.entity.Setting;
import org.springframework.stereotype.Component;

@Component
public class SettingMapper {

    public SettingResponse toResponse(Setting setting) {
        if (setting == null) return null;

        SettingResponse response = new SettingResponse();
        response.setId(setting.getId());
        response.setSettingKey(setting.getSettingKey());
        response.setSettingValue(setting.getSettingValue());
        response.setDescription(setting.getDescription());

        return response;
    }
}