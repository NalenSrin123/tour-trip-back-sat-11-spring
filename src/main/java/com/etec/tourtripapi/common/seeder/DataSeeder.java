package com.etec.tourtripapi.common.seeder;

import com.etec.tourtripapi.category.entity.Category;
import com.etec.tourtripapi.category.repository.CategoryRepository;
import com.etec.tourtripapi.common.enums.ScheduleStatus;
import com.etec.tourtripapi.destination.entity.Destination;
import com.etec.tourtripapi.destination.repository.DestinationRepository;
import com.etec.tourtripapi.schedule.entity.TourSchedule;
import com.etec.tourtripapi.tour.entity.Tour;
import com.etec.tourtripapi.tour.entity.TourImage;
import com.etec.tourtripapi.tour.repository.TourRepository;
import com.etec.tourtripapi.user.entity.User;
import com.etec.tourtripapi.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final DestinationRepository destinationRepository;
    private final CategoryRepository categoryRepository;
    private final TourRepository tourRepository;
    private final UserRepository userRepository;
    private final JdbcTemplate jdbcTemplate;

    private static final String[][] DESTS = {
            {"Phnom Penh", "Cambodia", "Cambodia's vibrant capital where royal palaces, riverside promenades and bustling markets meet."},
            {"Sihanoukville", "Cambodia", "Coastal city known for its beaches, seafood and gateway to the islands."},
            {"Koh Rong", "Cambodia", "Lush tropical island with powdery white sand and turquoise water."},
            {"Koh Rong Sanloem", "Cambodia", "Quieter sister island ideal for relaxation and clear-water snorkelling."},
            {"Battambang", "Cambodia", "Colonial-era town famed for its bamboo train and ancient temples."},
            {"Kep", "Cambodia", "Tranquil seaside town famous for crab market and pepper farms."},
            {"Kratie", "Cambodia", "Mekong riverside town and home of the Irrawaddy dolphins."},
            {"Sen Monorom", "Cambodia", "Cool highland town amid pine forests and elephant sanctuaries."},
            {"Banlung", "Cambodia", "Gateway to crater lakes, waterfalls and indigenous villages."},
            {"Preah Vihear Temple", "Cambodia", "Dramatic cliff-top temple on the Thai-Cambodian border."},
            {"Koh Ker", "Cambodia", "Remote ancient capital with a towering step pyramid."},
            {"Banteay Srei", "Cambodia", "Intricately carved pink sandstone temple near Angkor."},
            {"Tonle Sap Lake", "Cambodia", "Southeast Asia's largest freshwater lake with floating villages."},
            {"Kampong Cham", "Cambodia", "Riverside provincial capital with colonial charm."},
            {"Kampong Thom", "Cambodia", "Home to the pre-Angkorian temples of Sambor Prei Kuk."},
            {"Kirirom National Park", "Cambodia", "Pine-clad plateau with waterfalls and trekking trails."},
            {"Bokor Mountain", "Cambodia", "Misty hill station with abandoned French colonial buildings."},
            {"Otres Beach", "Cambodia", "Laid-back stretch of sand south of Sihanoukville."},
            {"Angkor Thom", "Cambodia", "Walled city of the Khmer empire with the Bayon temple."},
            {"Ta Prohm", "Cambodia", "Jungle-entwined temple made famous by Tomb Raider."},
            {"Cardamom Mountains", "Cambodia", "Dense rainforest range rich in wildlife and waterfalls."},
            {"Koh Kong", "Cambodia", "Mangrove coast and eco-tourism gateway to the Cardamoms."},
            {"Siem Reap", "Cambodia", "Gateway to Angkor Wat with lively markets and nightlife."},
            {"Kampot", "Cambodia", "Peaceful riverside town known for pepper and colonial architecture."}
    };

    private static final String[] CATEGORIES = {
            "Adventure", "Cultural", "Beach & Islands", "Nature & Wildlife", "Historical", "City Tour", "Trekking", "River Cruise", "National Park", "Family"
    };

    // { title, destination, category, price, durationDays, maxGroupSize, description }
    private static final String[][] TOURS = {
            {"Angkor Wat Sunrise Small Group Tour", "Siem Reap", "Cultural", "79", "1", "12", "Catch the sunrise over Angkor Wat and explore the ancient Khmer temples with a knowledgeable local guide."},
            {"Angkor Temples 3-Day Explorer", "Siem Reap", "Historical", "249", "3", "10", "A three-day deep dive into the Angkor archaeological park including Angkor Thom, Ta Prohm and Banteay Srei."},
            {"Tonle Sap Floating Village Half-Day", "Tonle Sap Lake", "Cultural", "45", "1", "15", "Cruise through floating villages and learn about life on Southeast Asia's largest freshwater lake."},
            {"Phnom Penh City & Killing Fields Tour", "Phnom Penh", "City Tour", "59", "1", "12", "Discover the Royal Palace, Silver Pagoda and the moving history of the Killing Fields and Tuol Sleng."},
            {"Koh Rong Island Beach Escape", "Koh Rong", "Beach & Islands", "189", "3", "8", "Relax on white-sand beaches, swim in turquoise water and enjoy stunning sunsets on a tropical island."},
            {"Koh Rong Sanloem Snorkel & Sunset", "Koh Rong Sanloem", "Beach & Islands", "99", "2", "10", "Snorkel vibrant reefs and unwind on the quieter sister island of Koh Rong Sanloem."},
            {"Mondulkiri Elephant Sanctuary Day", "Sen Monorom", "Nature & Wildlife", "120", "2", "8", "Spend time with rescued elephants in their natural habitat and support ethical wildlife tourism."},
            {"Ratanakiri Waterfalls & Crater Lake Trek", "Banlung", "Trekking", "145", "3", "10", "Trek through jungle to hidden waterfalls and the volcanic Yeak Laom crater lake."},
            {"Kampot Pepper Farm & Kep Crab Market", "Kep", "Cultural", "55", "1", "12", "Visit a world-famous pepper plantation and taste fresh seafood at the legendary Kep crab market."},
            {"Battambang Bamboo Train & Countryside", "Battambang", "Adventure", "49", "1", "12", "Ride the famous bamboo train and cycle through rice paddies and colonial-era countryside."},
            {"Kratie Dolphin Watching on the Mekong", "Kratie", "Nature & Wildlife", "65", "2", "10", "Spot endangered Irrawaddy dolphins on the Mekong and explore the charming riverside town of Kratie."},
            {"Cardamom Mountains Jungle Trek", "Cardamom Mountains", "Trekking", "210", "4", "8", "A multi-day rainforest expedition through one of Southeast Asia's largest remaining wilderness areas."},
            {"Preah Vihear Cliff Temple Excursion", "Preah Vihear Temple", "Historical", "135", "2", "10", "Journey to the dramatic cliff-top temple of Preah Vihear, a UNESCO World Heritage Site."},
            {"Kirirom National Park Day Trip", "Kirirom National Park", "National Park", "70", "1", "12", "Escape to pine forests, waterfalls and cool mountain air in Kirirom National Park."},
            {"Bokor Mountain & Waterfall Adventure", "Bokor Mountain", "Adventure", "85", "1", "12", "Explore the misty Bokor hill station, abandoned colonial buildings and nearby waterfalls."},
            {"Cambodia Family Discovery 5-Day", "Siem Reap", "Family", "599", "5", "16", "A family-friendly journey covering temples, floating villages and gentle adventures across Cambodia."},
            {"Mekong River Cruise & Sunset", "Phnom Penh", "River Cruise", "39", "1", "20", "Sail the Mekong at golden hour with drinks and panoramic views of the Phnom Penh skyline."},
            {"Koh Ker & Beng Mealea Remote Temples", "Koh Ker", "Historical", "95", "1", "10", "Venture off the beaten path to the jungle-swallowed temples of Koh Ker and Beng Mealea."}
    };

    private final Map<String, List<String>> imageMap = new HashMap<>();

    private void loadImageMap() {
        try (InputStream is = new ClassPathResource("seed/destination-images.txt").getInputStream();
             BufferedReader reader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                line = line.trim();
                if (line.isEmpty()) continue;
                String[] parts = line.split("\\|");
                if (parts.length < 2) continue;
                String name = parts[0].trim();
                List<String> urls = new ArrayList<>(Arrays.asList(parts).subList(1, parts.length));
                imageMap.put(name, urls);
            }
            log.info("Loaded image map for {} destinations", imageMap.size());
        } catch (Exception e) {
            log.warn("Could not load seed/destination-images.txt: {}", e.getMessage());
        }
    }

    private void seedCategories() {
        int created = 0;
        for (String c : CATEGORIES) {
            if (!categoryRepository.existsByName(c)) {
                Category cat = new Category();
                cat.setName(c);
                cat.setDescription(c + " tour category.");
                categoryRepository.save(cat);
                created++;
            }
        }
        log.info("Categories seeded: {} new", created);
    }

    private void seedDestinations() {
        int created = 0;
        int updated = 0;
        for (String[] d : DESTS) {
            String name = d[0];
            String country = d[1];
            String desc = d[2];
            List<String> imgs = imageMap.getOrDefault(name, new ArrayList<>());

            Destination dest = destinationRepository.findByName(name).orElse(null);
            if (dest == null) {
                dest = new Destination();
                dest.setName(name);
                dest.setCountry(country);
                dest.setDescription(desc);
                dest.setImages(new ArrayList<>(imgs));
                if (!imgs.isEmpty()) dest.setImageUrl(imgs.get(0));
                destinationRepository.save(dest);
                created++;
            } else {
                // Only fill images when the destination has none, so admin edits are preserved.
                if (dest.getImages() == null || dest.getImages().isEmpty()) {
                    dest.setImages(new ArrayList<>(imgs));
                    dest.setImageUrl(imgs.isEmpty() ? null : imgs.get(0));
                    destinationRepository.save(dest);
                    updated++;
                }
            }
        }
        log.info("Destinations: {} created, {} updated", created, updated);
    }

    private void seedTours() {
        User creator = userRepository.findByEmail("admin@gmail.com")
                .orElseGet(() -> userRepository.findAll().stream().findFirst().orElse(null));
        if (creator == null) {
            log.warn("No user available to own seeded tours; skipping tour seeding.");
            return;
        }

        int created = 0;
        int refreshed = 0;
        for (String[] t : TOURS) {
            String title = t[0];

            Destination dest = destinationRepository.findByName(t[1]).orElse(null);
            Category cat = categoryRepository.findByName(t[2]).orElse(null);
            if (dest == null || cat == null) {
                log.warn("Skipping tour '{}': missing destination '{}' or category '{}'", title, t[1], t[2]);
                continue;
            }

            Tour existing = tourRepository.findByTitle(title).orElse(null);
            if (existing != null) {
                if (refreshTourImages(existing, dest)) {
                    tourRepository.save(existing);
                    refreshed++;
                }
                continue;
            }

            int duration = Integer.parseInt(t[4]);
            int groupSize = Integer.parseInt(t[5]);

            Tour tour = new Tour();
            tour.setTitle(title);
            tour.setDescription(t[6]);
            tour.setDestination(dest);
            tour.setCategory(cat);
            tour.setCreatedBy(creator);
            tour.setPrice(new BigDecimal(t[3]));
            tour.setDurationDays(duration);
            tour.setMaxGroupSize(groupSize);
            tour.setIsPublished(true);
            tour.setRatingAvg(new BigDecimal("4.5"));
            tour.setItinerary(buildItinerary(dest.getName(), duration));
            tour.setIncludedItems("Professional English-speaking guide\nHotel pickup and drop-off\nEntrance fees\nBottled water");
            tour.setExcludedItems("Meals not mentioned\nPersonal expenses\nTravel insurance\nTips and gratuities");

            List<TourImage> images = new ArrayList<>();
            List<String> srcImgs = dest.getImages() != null ? dest.getImages() : new ArrayList<>();
            int count = Math.min(3, Math.max(1, srcImgs.size()));
            for (int i = 0; i < count; i++) {
                TourImage img = new TourImage();
                img.setTour(tour);
                img.setImageUrl(srcImgs.get(i));
                img.setSortOrder(i);
                img.setIsCover(i == 0);
                images.add(img);
            }
            tour.setImages(images);

            List<TourSchedule> schedules = new ArrayList<>();
            LocalDate base = LocalDate.now().plusDays(7);
            for (int s = 0; s < 3; s++) {
                TourSchedule sch = new TourSchedule();
                sch.setTour(tour);
                LocalDate start = base.plusDays(s * 14L);
                sch.setStartDate(start);
                sch.setEndDate(start.plusDays(Math.max(0, duration - 1)));
                sch.setAvailableSlots(groupSize);
                sch.setStatus(ScheduleStatus.ACTIVE);
                schedules.add(sch);
            }
            tour.setSchedules(schedules);

            tourRepository.save(tour);
            created++;
        }
        log.info("Tours seeded: {} new, {} image-refreshed", created, refreshed);
    }

    private boolean refreshTourImages(Tour tour, Destination dest) {
        List<String> srcImgs = dest.getImages() != null ? dest.getImages() : new ArrayList<>();
        if (srcImgs.isEmpty()) return false;

        List<TourImage> current = tour.getImages() != null ? tour.getImages() : new ArrayList<>();
        // Only refresh legacy/non-local images; leave an intentionally emptied gallery alone.
        boolean broken = !current.isEmpty() && current.stream()
                .anyMatch(img -> img.getImageUrl() == null
                        || !img.getImageUrl().startsWith("/api/v1/files/"));
        if (!broken) return false;

        int count = Math.min(3, srcImgs.size());
        List<TourImage> images = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            TourImage img = new TourImage();
            img.setTour(tour);
            img.setImageUrl(srcImgs.get(i));
            img.setSortOrder(i);
            img.setIsCover(i == 0);
            images.add(img);
        }
        tour.setImages(images);
        return true;
    }

    private String buildItinerary(String destination, int days) {
        StringBuilder sb = new StringBuilder();
        sb.append("Day 1: Meet your guide and begin exploring ").append(destination).append(".\n");
        for (int d = 2; d <= days; d++) {
            sb.append("Day ").append(d).append(": Continue your guided adventure with sightseeing and activities in ")
                    .append(destination).append(".\n");
        }
        sb.append("Final Day: Wrap up your journey and transfer back to your hotel.");
        return sb.toString();
    }

    private void ensureLongTextColumns() {
        alterColumnToText("destinations", "image_url");
        alterColumnToText("tour_images", "image_url");
        alterColumnToText("destination_images", "image_url");
    }

    private void alterColumnToText(String table, String column) {
        try {
            jdbcTemplate.execute("ALTER TABLE " + table + " ALTER COLUMN " + column + " TYPE TEXT");
            log.info("Migrated {}.{} to TEXT", table, column);
        } catch (Exception e) {
            log.debug("Skipping migration for {}.{}: {}", table, column, e.getMessage());
        }
    }

    /**
     * The PaymentMethod.ABA_PAY value was renamed to KHQR. payments.method is stored as a
     * plain string, so any rows written before the rename still hold 'ABA_PAY' and would
     * render as a stale label in the admin UI. Rewrite them once, at startup.
     */
    private void migratePaymentMethodNames() {
        try {
            int updated = jdbcTemplate.update(
                    "UPDATE payments SET method = 'KHQR' WHERE method = 'ABA_PAY'");
            if (updated > 0) {
                log.info("Migrated {} payment rows from ABA_PAY to KHQR", updated);
            }
        } catch (Exception e) {
            log.debug("Skipping payment method migration: {}", e.getMessage());
        }
    }

    @Override
    public void run(String... args) {
        ensureLongTextColumns();
        migratePaymentMethodNames();
        loadImageMap();
        seedCategories();
        seedDestinations();
        seedTours();
    }
}
