package gov.nic.apar.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;

/** Authority reviews an ACR: grade + remarks, optional flag. */
public record ReviewRequest(
        @NotBlank
        @Pattern(regexp = "Outstanding|Very Good|Good|Average|Below Average",
                message = "Select a valid APAR grade")
        String grade,
        @Size(max = 2000) String remarks,
        boolean flagged,
        @Size(max = 1000) String flagReason
) {}
