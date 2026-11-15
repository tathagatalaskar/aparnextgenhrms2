package gov.nic.apar.dto;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

/** Full ACR view: employee info + status + targets. */
public record AcrDetailView(
        Long statusId,
        Long employeeId,
        String fullName,
        String gender,
        LocalDate dateOfBirth,
        String departmentName,
        String officeName,
        String assessmentYear,
        boolean submitted,
        String grade,
        String authorityRemarks,
        boolean flagged,
        String flagReason,
        String reviewedByName,
        List<AcrTargetView> targets,
        OffsetDateTime submittedAt,
        OffsetDateTime reviewedAt
) {}
