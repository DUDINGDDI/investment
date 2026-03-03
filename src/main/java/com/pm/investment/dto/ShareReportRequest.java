package com.pm.investment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;

@Getter
public class ShareReportRequest {

    @NotBlank(message = "비전을 작성해주세요")
    @Size(min = 50, max = 499, message = "비전은 50자 이상 500자 미만으로 작성해주세요")
    private String vision;
}
