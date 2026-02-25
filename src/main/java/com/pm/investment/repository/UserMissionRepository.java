package com.pm.investment.repository;

import com.pm.investment.entity.UserMission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserMissionRepository extends JpaRepository<UserMission, Long> {

    List<UserMission> findByUserIdAndMissionId(Long userId, String missionId);

    Optional<UserMission> findByUser_IdAndMissionId(Long userId, String missionId);

    List<UserMission> findByUser_Id(Long userId);

    @Query("SELECT um FROM UserMission um JOIN FETCH um.user WHERE um.missionId = :missionId ORDER BY um.progress DESC, um.completedAt ASC")
    List<UserMission> findRankingByMissionId(@Param("missionId") String missionId);

    @Query("SELECT um FROM UserMission um JOIN FETCH um.user WHERE um.missionId IN :missionIds")
    List<UserMission> findByMissionIdIn(@Param("missionIds") List<String> missionIds);
}
