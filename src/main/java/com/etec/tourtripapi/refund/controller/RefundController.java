package com.etec.tourtripapi.refund.controller;

import com.etec.tourtripapi.common.response.PageResponse;
import com.etec.tourtripapi.refund.dto.request.RefundRequest;
import com.etec.tourtripapi.refund.dto.response.RefundResponse;
import com.etec.tourtripapi.refund.service.RefundService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/refunds")
@RequiredArgsConstructor
public class RefundController {

    private final RefundService refundService;

    @PostMapping
    public ResponseEntity<RefundResponse> requestRefund(@RequestBody RefundRequest request, Authentication authentication) {
        RefundResponse response = refundService.requestRefund(request, authentication.getName());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<RefundResponse>> getAllRefunds() {
        return ResponseEntity.ok(refundService.getAllRefunds());
    }

    @GetMapping("/page")
    public ResponseEntity<PageResponse<RefundResponse>> getRefundsPaged(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        return ResponseEntity.ok(refundService.getRefunds(page, size));
    }

    @GetMapping("/my-refunds")
    public ResponseEntity<List<RefundResponse>> getMyRefunds(Authentication authentication) {
        return ResponseEntity.ok(refundService.getMyRefunds(authentication.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RefundResponse> getRefundById(@PathVariable Long id) {
        return ResponseEntity.ok(refundService.getRefundById(id));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<RefundResponse> updateRefundStatus(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(refundService.updateRefundStatus(id, status));
    }
}