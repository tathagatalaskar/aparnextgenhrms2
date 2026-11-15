package gov.nic.apar.dto;

import java.time.LocalDate;

/** Employee directory / profile row. */
public record EmployeeView(
        Long employeeId,
        String fullName,
        String empIniName,
        String empFirstName,
        String empMidName,
        String empLastName,
        String gender,            // 'M' / 'F'
        LocalDate dateOfBirth,
        Long departmentId,
        String departmentName,
        Long officeId,
        String officeName,
        String designation,
        LocalDate joiningDate,
        String email,
        String mobileNumber,
        boolean active
) {}
