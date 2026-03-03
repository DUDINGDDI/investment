package com.pm.ideaboard.controller;

import com.pm.ideaboard.dto.IdeaBoardResponse;
import com.pm.ideaboard.service.IdeaBoardService;
import com.pm.ideaboard.service.SseEmitterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/idea-board")
@RequiredArgsConstructor
public class SseController {

    private final SseEmitterService sseEmitterService;
    private final IdeaBoardService ideaBoardService;

    @GetMapping(value = "/booths/{id}/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream(@PathVariable Long id) {
        SseEmitter emitter = sseEmitterService.subscribe(id);

        IdeaBoardResponse board = ideaBoardService.getBoard(id);
        sseEmitterService.sendInit(emitter, board);

        return emitter;
    }
}
