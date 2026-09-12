package com.etec.tourtripapi.notification.service;

import com.etec.tourtripapi.notification.dto.response.NotificationResponse;
import com.etec.tourtripapi.user.entity.User;

import java.util.List;

public interface NotificationService {
    void createNotification(User user, String type, String message);
    List<NotificationResponse> getUserNotifications(String userEmail);
    List<NotificationResponse> getUnreadNotifications(String userEmail);
    NotificationResponse markAsRead(Long id, String userEmail);
}