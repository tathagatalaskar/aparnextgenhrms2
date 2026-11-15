package gov.nic.apar.dto;

import jakarta.validation.constraints.*;

/** Employee edits their OWN contact details. */
public record UpdateProfileRequest(
        @Pattern(regexp = "\\d{10}", message = "Mobile must be 10 digits") String mobileNumber,
        @Email @Size(max = 150) String email,
        @Size(max = 120) String designation
) {}
