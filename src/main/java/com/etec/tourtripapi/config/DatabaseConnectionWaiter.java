package com.etec.tourtripapi.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;

import javax.sql.DataSource;
import java.sql.Connection;

/**
 * Blocks application startup until the database accepts a connection.
 *
 * On free-tier hosts (Render) the first boot races a cold Postgres/Neon pooler.
 * Without this gate Hibernate can start before JDBC metadata is available and
 * fail with "Unable to determine Dialect without JDBC metadata", killing the app
 * with exit code 1. Retrying here lets the app wait for the DB instead.
 */
@Configuration
public class DatabaseConnectionWaiter {

    @Bean
    @Order(0)
    public CommandLineRunner waitForDatabase(DataSource dataSource) {
        return args -> {
            long deadline = System.currentTimeMillis() + 120_000;
            Exception last = null;
            while (System.currentTimeMillis() < deadline) {
                try (Connection ignored = dataSource.getConnection()) {
                    return;
                } catch (Exception e) {
                    last = e;
                    Thread.sleep(2000);
                }
            }
            throw new IllegalStateException(
                    "Database not reachable after 120s", last);
        };
    }
}
