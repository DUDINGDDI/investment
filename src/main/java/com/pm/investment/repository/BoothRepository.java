package com.pm.investment.repository;

import com.pm.investment.entity.Booth;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BoothRepository extends JpaRepository<Booth, Long> {

    Optional<Booth> findByBoothUuid(String boothUuid);

    List<Booth> findAllByOrderByDisplayOrderAsc();

    List<Booth> findByZoneIdOrderByDisplayOrderAsc(Long zoneId);

    List<Booth> findByZoneZoneCodeOrderByDisplayOrderAsc(String zoneCode);

    List<Booth> findByNameContainingIgnoreCaseOrderByDisplayOrderAsc(String name);
}
