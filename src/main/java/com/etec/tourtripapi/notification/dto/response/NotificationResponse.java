package com.etec.tourtripapi.notification.dto.response;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class NotificationResponse {
    private Long id;
    private Long userId;
    private String type;
    private String message;
    private Boolean isRead;
    private LocalDateTime createdAt;
}