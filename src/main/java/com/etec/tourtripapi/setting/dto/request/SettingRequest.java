package com.etec.tourtripapi.setting.dto.request;

import lombok.Data;

@Data
public class SettingRequest {
    private String settingKey;
    private String settingValue;
    private String description;
}