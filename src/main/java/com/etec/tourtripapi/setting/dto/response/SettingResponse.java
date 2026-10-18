package com.etec.tourtripapi.setting.dto.response;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class SettingResponse {
    private Long id;
    private String settingKey;
    private String settingValue;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}