package com.etec.tourtripapi.booking.entity;

import com.etec.tourtripapi.schedule.entity.TourSchedule;
import com.etec.tourtripapi.user.entity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "schedule_id", nullable = false)
    private TourSchedule schedule;

    @Column(nullable = false)
    private Integer numberOfParticipants;

    @Column(nullable = false)
    private BigDecimal totalPrice;

    @Column(nullable = false)
    private String status; // e.g., PENDING, CONFIRMED, CANCELLED

    @Column(nullable = false)
    private LocalDateTime bookingDate;

    @PrePersist
    public void prePersist() {
        this.bookingDate = LocalDateTime.now();
        if (this.status == null) {
            this.status = "PENDING";
        }
    }
}