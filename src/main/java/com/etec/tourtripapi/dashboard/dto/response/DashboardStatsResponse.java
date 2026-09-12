package com.etec.tourtripapi.dashboard.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DashboardStatsResponse {
    private Long totalUsers;
    private Long totalTours;
    private Long totalBookings;
    private Double totalRevenue;
    private Long pendingRefunds;
}