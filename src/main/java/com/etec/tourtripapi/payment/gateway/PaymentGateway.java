package com.etec.tourtripapi.payment.gateway;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.UUID;

@Component
public class PaymentGateway {

    public boolean processPayment(String method, BigDecimal amount) {
        // Simulates connection to ABA Pay or Credit Card Processor API
        // Returns true if transaction is approved
        return true;
    }

    public String generateTransactionId() {
        return "TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}