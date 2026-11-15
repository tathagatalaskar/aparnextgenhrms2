package gov.nic.apar.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDate;

/** Public self-registration for a new employee. */
public record RegisterRequest(
        @NotBlank @Email @Size(max = 150) String email,
        @NotBlank @Size(min = 8, max = 72) String password,
        @Size(max = 30) String empIniName,
        @NotBlank @Size(max = 100) String empFirstName,
        @Size(max = 30) String empMidName,
        @NotBlank @Size(max = 30) String empLastName,
        @NotBlank @Pattern(regexp = "[MF]", message = "Gender must be M or F") String gender,
        @NotNull @Past LocalDate dateOfBirth,
        @NotNull Long departmentId,
        @Size(max = 120) String designation,
        @Pattern(regexp = "\\d{10}", message = "Mobile must be 10 digits") String mobileNumber
) {}
