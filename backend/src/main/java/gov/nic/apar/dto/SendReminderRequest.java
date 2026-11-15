package gov.nic.apar.dto;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;

/** Authority sends APAR reminders to selected employees (unlocks their APAR form). */
public record SendReminderRequest(
        @NotEmpty List<Long> employeeIds
) {}
