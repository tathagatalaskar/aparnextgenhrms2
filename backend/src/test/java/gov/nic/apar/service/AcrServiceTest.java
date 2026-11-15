package gov.nic.apar.service;

import gov.nic.apar.dto.ReviewRequest;
import gov.nic.apar.dto.SubmitAcrRequest;
import gov.nic.apar.dto.SubmitEligibilityView;
import gov.nic.apar.entity.EmployeeAcrStatus;
import gov.nic.apar.entity.Role;
import gov.nic.apar.entity.UserAccount;
import gov.nic.apar.exception.BadRequestException;
import gov.nic.apar.repository.EmployeeAcrDetailRepository;
import gov.nic.apar.repository.EmployeeAcrStatusRepository;
import gov.nic.apar.repository.EmployeeDetailsRepository;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

class AcrServiceTest {

    @Test
    void submitRejectsAssessmentYearThatDoesNotMatchTheOpenCycle() {
        EmployeeDetailsRepository employees = mock(EmployeeDetailsRepository.class);
        EmployeeAcrStatusRepository statuses = mock(EmployeeAcrStatusRepository.class);
        EmployeeAcrDetailRepository details = mock(EmployeeAcrDetailRepository.class);
        AcrMapper mapper = mock(AcrMapper.class);
        LookupService lookup = mock(LookupService.class);
        NotificationService notifications = mock(NotificationService.class);

        when(notifications.eligibility(81851L)).thenReturn(
                new SubmitEligibilityView(true, "2025-2026", LocalDate.now().plusDays(7), true, false, true));

        AcrService service = new AcrService(employees, statuses, details, mapper, lookup, notifications);
        UserAccount employee = UserAccount.builder()
                .employeeId(81851L)
                .role(Role.EMPLOYEE)
                .isActive(true)
                .build();
        SubmitAcrRequest request = new SubmitAcrRequest("2024-2025", java.util.List.of());

        assertThrows(BadRequestException.class, () -> service.submit(request, employee));
        verify(employees, never()).findByEmployeeId(anyLong());
        verify(statuses, never()).save(any(EmployeeAcrStatus.class));
    }

    @Test
    void reviewRequiresAReasonWhenFlagged() {
        EmployeeDetailsRepository employees = mock(EmployeeDetailsRepository.class);
        EmployeeAcrStatusRepository statuses = mock(EmployeeAcrStatusRepository.class);
        EmployeeAcrDetailRepository details = mock(EmployeeAcrDetailRepository.class);
        AcrMapper mapper = mock(AcrMapper.class);
        LookupService lookup = mock(LookupService.class);
        NotificationService notifications = mock(NotificationService.class);

        EmployeeAcrStatus submitted = EmployeeAcrStatus.builder()
                .id(99L)
                .employeeId(81851L)
                .isAcrSubmitted(true)
                .build();
        when(statuses.findById(99L)).thenReturn(Optional.of(submitted));

        AcrService service = new AcrService(employees, statuses, details, mapper, lookup, notifications);
        UserAccount authority = UserAccount.builder()
                .employeeId(81848L)
                .role(Role.AUTHORITY)
                .isActive(true)
                .build();

        assertThrows(BadRequestException.class,
                () -> service.review(99L, new ReviewRequest("Good", "Check required", true, "  "), authority));
        verify(statuses, never()).save(any(EmployeeAcrStatus.class));
        verifyNoInteractions(notifications);
    }
}
