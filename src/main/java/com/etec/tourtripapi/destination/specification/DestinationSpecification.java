package com.etec.tourtripapi.destination.specification;

import com.etec.tourtripapi.destination.entity.Destination;
import org.springframework.data.jpa.domain.Specification;

public class DestinationSpecification {

    public static Specification<Destination> hasName(String name) {
        return (root, query, cb) -> (name == null || name.isEmpty()) ? null : cb.like(cb.lower(root.get("name")), "%" + name.toLowerCase() + "%");
    }

    public static Specification<Destination> hasCountry(String country) {
        return (root, query, cb) -> (country == null || country.isEmpty()) ? null : cb.like(cb.lower(root.get("country")), "%" + country.toLowerCase() + "%");
    }
}