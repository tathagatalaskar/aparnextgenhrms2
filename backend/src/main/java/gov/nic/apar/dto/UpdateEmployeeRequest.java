package gov.nic.apar.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDate;

/** Authority edits an existing employee's details. */
public record UpdateEmployeeRequest(
        @Size(max = 30) String empIniName,
        @NotBlank @Size(max = 100) String empFirstName,
        @Size(max = 30) String empMidName,
        @NotBlank @Size(max = 30) String empLastName,
        @NotBlank @Pattern(regexp = "[MF]") String gender,
        @NotNull @Past LocalDate dateOfBirth,
        @NotNull Long departmentId,
        Long officeId,
        @Size(max = 120) String designation,
        LocalDate joiningDate,
        @Pattern(regexp = "\\d{10}") String mobileNumber,
        @Email @Size(max = 150) String email
) {}
