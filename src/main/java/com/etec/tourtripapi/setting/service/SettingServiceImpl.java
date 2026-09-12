package com.etec.tourtripapi.setting.service;

import com.etec.tourtripapi.common.exception.ResourceNotFoundException;
import com.etec.tourtripapi.setting.dto.request.SettingRequest;
import com.etec.tourtripapi.setting.dto.response.SettingResponse;
import com.etec.tourtripapi.setting.entity.Setting;
import com.etec.tourtripapi.setting.mapper.SettingMapper;
import com.etec.tourtripapi.setting.repository.SettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SettingServiceImpl implements SettingService {

    private final SettingRepository settingRepository;
    private final SettingMapper settingMapper;

    @Override
    public List<SettingResponse> getAllSettings() {
        return settingRepository.findAll().stream()
                .map(settingMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public SettingResponse getSettingByKey(String key) {
        Setting setting = settingRepository.findBySettingKey(key)
                .orElseThrow(() -> new ResourceNotFoundException("Setting not found with key: " + key));
        return settingMapper.toResponse(setting);
    }

    @Override
    @Transactional
    public SettingResponse saveOrUpdateSetting(SettingRequest request) {
        Setting setting = settingRepository.findBySettingKey(request.getSettingKey())
                .orElse(new Setting());

        setting.setSettingKey(request.getSettingKey());
        setting.setSettingValue(request.getSettingValue());
        setting.setDescription(request.getDescription());

        return settingMapper.toResponse(settingRepository.save(setting));
    }

    @Override
    @Transactional
    public void deleteSetting(Long id) {
        if (!settingRepository.existsById(id)) {
            throw new ResourceNotFoundException("Setting not found with id: " + id);
        }
        settingRepository.deleteById(id);
    }
}