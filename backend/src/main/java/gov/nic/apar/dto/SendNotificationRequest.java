package gov.nic.apar.dto;

import jakarta.validation.constraints.*;
import java.util.List;

/** Authority sends a manual notification. */
public record SendNotificationRequest(
        @NotBlank @Pattern(regexp = "ONE|MANY|DEPARTMENT|ALL",
                message = "targetType must be ONE, MANY, DEPARTMENT or ALL") String targetType,
        List<Long> employeeIds,    // for ONE / MANY
        Long departmentId,         // for DEPARTMENT
        @NotBlank @Size(max = 150) String title,
        @NotBlank @Size(max = 2000) String message
) {}
