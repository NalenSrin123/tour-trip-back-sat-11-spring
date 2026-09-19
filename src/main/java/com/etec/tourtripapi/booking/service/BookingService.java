package com.etec.tourtripapi.booking.service;

import com.etec.tourtripapi.booking.dto.request.BookingRequest;
import com.etec.tourtripapi.booking.dto.response.BookingResponse;
import com.etec.tourtripapi.booking.entity.Booking;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;

public interface BookingService {
    BookingResponse createBooking(BookingRequest request, String userEmail);
    List<BookingResponse> getAllBookings(Specification<Booking> spec);
    List<BookingResponse> getMyBookings(String userEmail);
    BookingResponse getBookingById(Long id);
    BookingResponse updateBookingStatus(Long id, String status);
    void cancelBooking(Long id, String userEmail);
}