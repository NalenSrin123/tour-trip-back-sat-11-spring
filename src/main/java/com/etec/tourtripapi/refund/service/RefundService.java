package com.etec.tourtripapi.refund.service;


import com.etec.tourtripapi.refund.dto.request.RefundRequest;
import com.etec.tourtripapi.refund.dto.response.RefundResponse;

import java.util.List;

public interface RefundService {
    RefundResponse requestRefund(RefundRequest request);
    List<RefundResponse> getAllRefunds();
    RefundResponse getRefundById(Long id);
    RefundResponse updateRefundStatus(Long id, String status);
}