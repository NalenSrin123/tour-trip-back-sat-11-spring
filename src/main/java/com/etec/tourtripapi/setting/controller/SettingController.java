package com.etec.tourtripapi.setting.controller;

import com.etec.tourtripapi.setting.dto.request.SettingRequest;
import com.etec.tourtripapi.setting.dto.response.SettingResponse;
import com.etec.tourtripapi.setting.service.SettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/settings")
@RequiredArgsConstructor
public class SettingController {

    private final SettingService settingService;

    @GetMapping
    public ResponseEntity<List<SettingResponse>> getAllSettings() {
        return ResponseEntity.ok(settingService.getAllSettings());
    }

    @GetMapping("/key/{key}")
    public ResponseEntity<SettingResponse> getSettingByKey(@PathVariable String key) {
        return ResponseEntity.ok(settingService.getSettingByKey(key));
    }

    @PostMapping
    public ResponseEntity<SettingResponse> saveOrUpdateSetting(@RequestBody SettingRequest request) {
        return ResponseEntity.ok(settingService.saveOrUpdateSetting(request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSetting(@PathVariable Long id) {
        settingService.deleteSetting(id);
        return ResponseEntity.noContent().build();
    }
}