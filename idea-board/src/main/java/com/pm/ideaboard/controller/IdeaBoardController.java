package com.pm.ideaboard.controller;

import com.pm.ideaboard.dto.IdeaBoardResponse;
import com.pm.ideaboard.service.IdeaBoardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/idea-board")
@RequiredArgsConstructor
public class IdeaBoardController {

    private final IdeaBoardService ideaBoardService;

    @GetMapping("/booths/{id}")
    public ResponseEntity<IdeaBoardResponse> getBoard(@PathVariable Long id) {
        return ResponseEntity.ok(ideaBoardService.getBoard(id));
    }
}
