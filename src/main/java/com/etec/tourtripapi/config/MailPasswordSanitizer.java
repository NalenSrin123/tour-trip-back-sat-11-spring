package com.etec.tourtripapi.config;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.stereotype.Component;

/**
 * Gmail app passwords are displayed as four groups of four characters
 * ("abcd efgh ijkl mnop"). If that value is pasted with the display spaces into
 * spring.mail.password, SMTP authentication fails. This strips all whitespace
 * from the configured password so it works whether or not the spaces are present.
 */
@Component
@RequiredArgsConstructor
public class MailPasswordSanitizer {

    private final JavaMailSender mailSender;

    @PostConstruct
    public void stripPasswordWhitespace() {
        if (mailSender instanceof JavaMailSenderImpl impl && impl.getPassword() != null) {
            impl.setPassword(impl.getPassword().replaceAll("\\s", ""));
        }
    }
}
