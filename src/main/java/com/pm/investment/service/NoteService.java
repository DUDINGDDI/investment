package com.pm.investment.service;

import com.pm.investment.dto.NoteResponse;
import com.pm.investment.dto.UserSearchResponse;
import com.pm.investment.entity.Note;
import com.pm.investment.entity.User;
import com.pm.investment.repository.NoteRepository;
import com.pm.investment.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NoteService {

    private final NoteRepository noteRepository;
    private final UserRepository userRepository;

    @Transactional
    public void sendNote(Long senderId, Long receiverId, String content) {
        if (senderId.equals(receiverId)) {
            throw new IllegalArgumentException("자기 자신에게 쪽지를 보낼 수 없습니다");
        }

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new IllegalArgumentException("발신자를 찾을 수 없습니다"));

        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new IllegalArgumentException("수신자를 찾을 수 없습니다"));

        noteRepository.save(new Note(sender, receiver, content));
    }

    @Transactional(readOnly = true)
    public List<NoteResponse> getReceivedNotes(Long userId) {
        return noteRepository.findByReceiverIdWithUsers(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<NoteResponse> getSentNotes(Long userId) {
        return noteRepository.findBySenderIdWithUsers(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public void markAsRead(Long noteId, Long userId) {
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new IllegalArgumentException("쪽지를 찾을 수 없습니다"));

        if (!note.getReceiver().getId().equals(userId)) {
            throw new IllegalArgumentException("본인의 쪽지만 읽을 수 있습니다");
        }

        note.setIsRead(true);
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        return noteRepository.countUnreadByReceiverId(userId);
    }

    @Transactional(readOnly = true)
    public List<UserSearchResponse> searchUsers(String keyword, Long excludeUserId) {
        return userRepository.findByNameContainingAndIdNot(keyword, excludeUserId)
                .stream()
                .map(u -> UserSearchResponse.builder()
                        .userId(u.getId())
                        .name(u.getName())
                        .company(u.getCompany())
                        .uniqueCode(u.getUniqueCode())
                        .build())
                .toList();
    }

    private NoteResponse toResponse(Note note) {
        return NoteResponse.builder()
                .id(note.getId())
                .senderId(note.getSender().getId())
                .senderName(note.getSender().getName())
                .senderCompany(note.getSender().getCompany())
                .receiverId(note.getReceiver().getId())
                .receiverName(note.getReceiver().getName())
                .receiverCompany(note.getReceiver().getCompany())
                .content(note.getContent())
                .isRead(note.getIsRead())
                .createdAt(note.getCreatedAt())
                .build();
    }
}
