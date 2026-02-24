package com.pm.investment.repository;

import com.pm.investment.entity.Booth;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BoothRepository extends JpaRepository<Booth, Long> {

    List<Booth> findAllByOrderByDisplayOrderAsc();

    List<Booth> findByZoneIdOrderByDisplayOrderAsc(Long zoneId);

    List<Booth> findByZoneZoneCodeOrderByDisplayOrderAsc(String zoneCode);

    List<Booth> findByNameContainingIgnoreCaseOrderByDisplayOrderAsc(String name);
}
