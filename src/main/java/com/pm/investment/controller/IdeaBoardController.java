package com.pm.investment.controller;

import com.pm.investment.dto.IdeaBoardResponse;
import com.pm.investment.dto.StockCommentResponse;
import com.pm.investment.entity.StockBooth;
import com.pm.investment.repository.StockBoothRepository;
import com.pm.investment.service.StockCommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/idea-board")
@RequiredArgsConstructor
public class IdeaBoardController {

    private final StockBoothRepository stockBoothRepository;
    private final StockCommentService stockCommentService;

    @GetMapping("/booths/{id}")
    public ResponseEntity<IdeaBoardResponse> getBoard(@PathVariable Long id) {
        StockBooth booth = stockBoothRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("부스를 찾을 수 없습니다"));

        List<StockCommentResponse> comments = stockCommentService.getComments(id, null);

        IdeaBoardResponse response = IdeaBoardResponse.builder()
                .boothId(booth.getId())
                .boothName(booth.getName())
                .logoEmoji(booth.getLogoEmoji())
                .themeColor(booth.getThemeColor())
                .category(booth.getCategory())
                .comments(comments)
                .build();

        return ResponseEntity.ok(response);
    }
}
