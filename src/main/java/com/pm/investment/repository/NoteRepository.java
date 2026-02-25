package com.pm.investment.repository;

import com.pm.investment.entity.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NoteRepository extends JpaRepository<Note, Long> {

    @Query("SELECT n FROM Note n JOIN FETCH n.sender JOIN FETCH n.receiver WHERE n.receiver.id = :receiverId ORDER BY n.createdAt DESC")
    List<Note> findByReceiverIdWithUsers(@Param("receiverId") Long receiverId);

    @Query("SELECT n FROM Note n JOIN FETCH n.sender JOIN FETCH n.receiver WHERE n.sender.id = :senderId ORDER BY n.createdAt DESC")
    List<Note> findBySenderIdWithUsers(@Param("senderId") Long senderId);

    @Query("SELECT COUNT(n) FROM Note n WHERE n.receiver.id = :receiverId AND n.isRead = false")
    long countUnreadByReceiverId(@Param("receiverId") Long receiverId);
}
