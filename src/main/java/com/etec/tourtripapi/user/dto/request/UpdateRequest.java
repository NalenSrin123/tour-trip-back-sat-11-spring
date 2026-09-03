package com.etec.tourtripapi.user.dto.request;

import lombok.Data;

@Data
public class UpdateRequest {
    private String fullName;
    private String phoneNumber;
    private Boolean active;
}
