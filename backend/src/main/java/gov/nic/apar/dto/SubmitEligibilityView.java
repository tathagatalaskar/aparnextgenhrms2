package gov.nic.apar.dto;

import java.time.LocalDate;

/** Tells the employee UI whether the APAR form is unlocked for them. */
public record SubmitEligibilityView(
        boolean cycleOpen,
        String assessmentYear,
        LocalDate dueDate,
        boolean reminded,          // authority has sent an APAR reminder
        boolean alreadySubmitted,
        boolean canSubmit          // cycleOpen && reminded && !alreadySubmitted
) {}
