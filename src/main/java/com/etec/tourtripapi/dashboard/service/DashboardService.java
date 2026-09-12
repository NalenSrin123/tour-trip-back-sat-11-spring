package com.etec.tourtripapi.dashboard.service;

import com.etec.tourtripapi.dashboard.dto.response.DashboardStatsResponse;

public interface DashboardService {
    DashboardStatsResponse getAdminDashboardStats();
}