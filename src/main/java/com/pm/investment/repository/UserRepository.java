package com.pm.investment.repository;

import com.pm.investment.entity.User;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUniqueCode(String uniqueCode);

    Optional<User> findByUniqueCodeAndName(String uniqueCode, String name);

    List<User> findByBelongingBooth_Id(Long boothId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT u FROM User u WHERE u.id = :id")
    Optional<User> findByIdWithLock(@Param("id") Long id);

    List<User> findByNameContainingAndIdNot(String name, Long id);
}
