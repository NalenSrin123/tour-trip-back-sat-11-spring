package com.etec.tourtripapi.booking.mapper;

import com.etec.tourtripapi.booking.dto.response.BookingResponse;
import com.etec.tourtripapi.booking.entity.Booking;
import org.springframework.stereotype.Component;

@Component
public class BookingMapper {

    public BookingResponse toResponse(Booking booking) {
        if (booking == null) return null;

        BookingResponse response = new BookingResponse();
        response.setId(booking.getId());
        response.setUserId(booking.getUser() != null ? booking.getUser().getId() : null);
        response.setUserEmail(booking.getUser() != null ? booking.getUser().getEmail() : null);

        if (booking.getSchedule() != null) {
            response.setScheduleId(booking.getSchedule().getId());
            response.setStartDate(booking.getSchedule().getStartDate());
            response.setEndDate(booking.getSchedule().getEndDate());
            if (booking.getSchedule().getTour() != null) {
                response.setTourId(booking.getSchedule().getTour().getId());
                response.setTourTitle(booking.getSchedule().getTour().getTitle());
            }
        }

        response.setNumberOfParticipants(booking.getNumberOfParticipants());
        response.setTotalPrice(booking.getTotalPrice());
        response.setStatus(booking.getStatus());
        response.setBookingDate(booking.getBookingDate());

        return response;
    }
}