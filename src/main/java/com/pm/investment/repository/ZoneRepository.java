package com.pm.investment.repository;

import com.pm.investment.entity.Zone;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ZoneRepository extends JpaRepository<Zone, Long> {

    List<Zone> findAllByOrderByDisplayOrderAsc();

    Optional<Zone> findByZoneCode(String zoneCode);
}
