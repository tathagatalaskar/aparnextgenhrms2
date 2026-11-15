package gov.nic.apar.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDate;

/** Authority adds an employee. Optionally also creates a login account. */
public record AddEmployeeRequest(
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
        @Pattern(regexp = "\\d{10}", message = "Mobile must be 10 digits") String mobileNumber,
        @Email @Size(max = 150) String email,
        // if true and email+password given, also create an EMPLOYEE login
        boolean createLogin,
        @Size(min = 8, max = 72) String password
) {}
