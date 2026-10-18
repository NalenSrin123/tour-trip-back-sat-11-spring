package com.etec.tourtripapi.refund.service;


import com.etec.tourtripapi.common.response.PageResponse;
import com.etec.tourtripapi.refund.dto.request.RefundRequest;
import com.etec.tourtripapi.refund.dto.response.RefundResponse;

import java.util.List;

public interface RefundService {
    RefundResponse requestRefund(RefundRequest request, String userEmail);
    List<RefundResponse> getAllRefunds();
    PageResponse<RefundResponse> getRefunds(int page, int size);
    List<RefundResponse> getMyRefunds(String userEmail);
    RefundResponse getRefundById(Long id);
    RefundResponse updateRefundStatus(Long id, String status);
}