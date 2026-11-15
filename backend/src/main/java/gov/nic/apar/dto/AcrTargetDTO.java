package gov.nic.apar.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AcrTargetDTO(
        @NotBlank @Size(max = 2000) String target,
        @NotBlank @Size(max = 2000) String achievements
) {}
