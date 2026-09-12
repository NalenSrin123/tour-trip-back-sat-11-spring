package com.etec.tourtripapi.booking.service;

import com.etec.tourtripapi.booking.dto.request.BookingRequest;
import com.etec.tourtripapi.booking.dto.response.BookingResponse;
import com.etec.tourtripapi.booking.entity.Booking;
import com.etec.tourtripapi.booking.mapper.BookingMapper;
import com.etec.tourtripapi.booking.repository.BookingRepository;
import com.etec.tourtripapi.common.exception.ConflictException;
import com.etec.tourtripapi.common.exception.ResourceNotFoundException;
import com.etec.tourtripapi.schedule.entity.TourSchedule;
import com.etec.tourtripapi.schedule.repository.TourScheduleRepository;
import com.etec.tourtripapi.user.entity.User;
import com.etec.tourtripapi.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final TourScheduleRepository scheduleRepository;
    private final UserRepository userRepository;
    private final BookingMapper bookingMapper;

    @Override
    @Transactional
    public BookingResponse createBooking(BookingRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        TourSchedule schedule = scheduleRepository.findById(request.getScheduleId())
                .orElseThrow(() -> new ResourceNotFoundException("Tour schedule not found with id: " + request.getScheduleId()));

        if (schedule.getAvailableSlots() < request.getNumberOfParticipants()) {
            throw new ConflictException("Not enough available slots! Only " + schedule.getAvailableSlots() + " slots left.");
        }

        // Deduct slots and save schedule
        schedule.setAvailableSlots(schedule.getAvailableSlots() - request.getNumberOfParticipants());
        scheduleRepository.save(schedule);

        // Calculate total price
        BigDecimal tourPrice = schedule.getTour().getPrice();
        BigDecimal totalPrice = tourPrice.multiply(BigDecimal.valueOf(request.getNumberOfParticipants()));

        Booking booking = new Booking();
        booking.setUser(user);
        booking.setSchedule(schedule);
        booking.setNumberOfParticipants(request.getNumberOfParticipants());
        booking.setTotalPrice(totalPrice);
        booking.setStatus("CONFIRMED");

        return bookingMapper.toResponse(bookingRepository.save(booking));
    }

    @Override
    public List<BookingResponse> getAllBookings(Specification<Booking> spec) {
        return bookingRepository.findAll(spec).stream()
                .map(bookingMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<BookingResponse> getMyBookings(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));
        return bookingRepository.findByUserId(user.getId()).stream()
                .map(bookingMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public BookingResponse getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));
        return bookingMapper.toResponse(booking);
    }

    @Override
    public BookingResponse updateBookingStatus(Long id, String status) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));
        booking.setStatus(status);
        return bookingMapper.toResponse(bookingRepository.save(booking));
    }

    @Override
    @Transactional
    public void cancelBooking(Long id, String userEmail) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));

        // Restore slots back to the tour schedule
        TourSchedule schedule = booking.getSchedule();
        schedule.setAvailableSlots(schedule.getAvailableSlots() + booking.getNumberOfParticipants());
        scheduleRepository.save(schedule);

        booking.setStatus("CANCELLED");
        bookingRepository.save(booking);
    }
}