package com.pm.investment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class NoteRequest {

    @NotNull(message = "수신자 ID는 필수입니다")
    private Long receiverId;

    @NotBlank(message = "쪽지 내용은 필수입니다")
    @Size(max = 50, message = "쪽지는 50자 이내로 작성해주세요")
    private String content;
}
