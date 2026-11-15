package gov.nic.apar.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.List;

/** Employee submits their ACR (self-appraisal targets/achievements). */
public record SubmitAcrRequest(
        @NotBlank @Size(min = 4, max = 9) String assessmentYear,
        @NotNull @Size(min = 1, max = 15) @Valid List<AcrTargetDTO> targets
) {}
