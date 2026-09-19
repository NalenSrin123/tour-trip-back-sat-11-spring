package com.etec.tourtripapi.setting.dto.response;

import lombok.Data;

@Data
public class SettingResponse {
    private Long id;
    private String settingKey;
    private String settingValue;
    private String description;
}