package gov.nic.apar.dto;

import java.time.OffsetDateTime;

/** List-row view for dashboards. */
public record AcrSummaryView(
        Long statusId,
        Long employeeId,
        String fullName,
        String departmentName,
        String assessmentYear,
        boolean submitted,
        boolean reviewed,
        boolean flagged,
        String grade,
        OffsetDateTime submittedAt
) {}
