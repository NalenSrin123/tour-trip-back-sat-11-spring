package com.etec.tourtripapi.tour.dto.response;

import lombok.Data;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Lightweight aggregate counts for the storefront homepage: how many published
 * tours belong to each destination / category. Avoids downloading the full tour
 * list just to compute counts on the client.
 */
@Data
public class TourFacetsResponse {
    private Map<String, Long> destinations = new LinkedHashMap<>();
    private Map<String, Long> categories = new LinkedHashMap<>();
}
