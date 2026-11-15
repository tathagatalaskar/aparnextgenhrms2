package gov.nic.apar.dto;

import java.time.LocalDate;

/** Authority view: an employee who has not yet submitted for the open cycle. */
public record PendingReportView(
        Long employeeId,
        String fullName,
        String departmentName,
        String assessmentYear,
        LocalDate dueDate,
        boolean reminded
) {}
