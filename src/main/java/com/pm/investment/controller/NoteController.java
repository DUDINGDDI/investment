package com.pm.investment.controller;

import com.pm.investment.dto.NoteRequest;
import com.pm.investment.dto.NoteResponse;
import com.pm.investment.dto.UserSearchResponse;
import com.pm.investment.service.NoteService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notes")
@RequiredArgsConstructor
public class NoteController {

    private final NoteService noteService;

    @PostMapping
    public ResponseEntity<Map<String, String>> sendNote(
            @Valid @RequestBody NoteRequest request,
            HttpServletRequest httpRequest) {
        Long userId = (Long) httpRequest.getAttribute("userId");
        noteService.sendNote(userId, request.getReceiverId(), request.getContent());
        return ResponseEntity.ok(Map.of("message", "쪽지가 전송되었습니다"));
    }

    @GetMapping("/received")
    public ResponseEntity<List<NoteResponse>> getReceivedNotes(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(noteService.getReceivedNotes(userId));
    }

    @GetMapping("/sent")
    public ResponseEntity<List<NoteResponse>> getSentNotes(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(noteService.getSentNotes(userId));
    }

    @PatchMapping("/{noteId}/read")
    public ResponseEntity<Map<String, String>> markAsRead(
            @PathVariable Long noteId,
            HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        noteService.markAsRead(noteId, userId);
        return ResponseEntity.ok(Map.of("message", "읽음 처리되었습니다"));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        long count = noteService.getUnreadCount(userId);
        return ResponseEntity.ok(Map.of("count", count));
    }

    @GetMapping("/users/search")
    public ResponseEntity<List<UserSearchResponse>> searchUsers(
            @RequestParam String keyword,
            HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(noteService.searchUsers(keyword, userId));
    }
}
