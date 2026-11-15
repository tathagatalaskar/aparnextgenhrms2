package gov.nic.apar.service;

import gov.nic.apar.dto.MessageResponse;
import gov.nic.apar.entity.AcrCycle;
import gov.nic.apar.entity.EmployeeDetails;
import gov.nic.apar.entity.EmployeeAcrStatus;
import gov.nic.apar.entity.Role;
import gov.nic.apar.entity.UserAccount;
import gov.nic.apar.exception.BadRequestException;
import gov.nic.apar.repository.*;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.*;

class NotificationServiceTest {

    @Test
    void remindersOnlyReachActiveEmployeeAccountsAndDeduplicateIds() {
        NotificationRepository notifications = mock(NotificationRepository.class);
        EmployeeDetailsRepository employees = mock(EmployeeDetailsRepository.class);
        UserAccountRepository accounts = mock(UserAccountRepository.class);
        EmployeeAcrStatusRepository statuses = mock(EmployeeAcrStatusRepository.class);
        AcrCycleRepository cycles = mock(AcrCycleRepository.class);
        LookupService lookup = mock(LookupService.class);

        when(cycles.findFirstByIsOpenTrueOrderByDueDateDesc()).thenReturn(Optional.of(
                AcrCycle.builder().assessmentYear("2025-2026")
                        .dueDate(LocalDate.now(ZoneId.of("Asia/Kolkata")).plusDays(7)).isOpen(true).build()));
        when(accounts.findAll()).thenReturn(List.of(
                UserAccount.builder().employeeId(11L).role(Role.EMPLOYEE).isActive(true).build(),
                UserAccount.builder().employeeId(12L).role(Role.EMPLOYEE).isActive(false).build(),
                UserAccount.builder().employeeId(13L).role(Role.AUTHORITY).isActive(true).build()));
        when(employees.findByIsActiveTrue()).thenReturn(List.of(
                EmployeeDetails.builder().employeeId(11L).isActive(true).build()));

        NotificationService service = new NotificationService(
                notifications, employees, accounts, statuses, cycles, lookup);

        MessageResponse response = service.sendReminders(List.of(11L, 11L, 12L, 13L, 404L), 99L);

        assertEquals("APAR reminder sent to 1 employee(s).", response.message());
        verify(notifications, times(1)).save(argThat(n ->
                n.getRecipientEmployeeId().equals(11L) &&
                "APAR_REMINDER".equals(n.getType()) &&
                "2025-2026".equals(n.getAssessmentYear())));
        verify(employees, times(1)).findByIsActiveTrue();
    }

    @Test
    void remindersRejectSelectionWithNoActiveEmployeeLogin() {
        NotificationRepository notifications = mock(NotificationRepository.class);
        EmployeeDetailsRepository employees = mock(EmployeeDetailsRepository.class);
        UserAccountRepository accounts = mock(UserAccountRepository.class);
        EmployeeAcrStatusRepository statuses = mock(EmployeeAcrStatusRepository.class);
        AcrCycleRepository cycles = mock(AcrCycleRepository.class);
        LookupService lookup = mock(LookupService.class);

        when(cycles.findFirstByIsOpenTrueOrderByDueDateDesc()).thenReturn(Optional.of(
                AcrCycle.builder().assessmentYear("2025-2026")
                        .dueDate(LocalDate.now(ZoneId.of("Asia/Kolkata")).plusDays(7)).isOpen(true).build()));
        when(accounts.findAll()).thenReturn(List.of(
                UserAccount.builder().employeeId(12L).role(Role.EMPLOYEE).isActive(false).build()));
        when(employees.findByIsActiveTrue()).thenReturn(List.of(
                EmployeeDetails.builder().employeeId(12L).isActive(true).build()));

        NotificationService service = new NotificationService(
                notifications, employees, accounts, statuses, cycles, lookup);

        assertThrows(BadRequestException.class, () -> service.sendReminders(List.of(12L), 99L));
        verify(notifications, never()).save(any());
        verify(employees, times(1)).findByIsActiveTrue();
    }
    @Test
    void manualRemindersAreRejectedAfterTheCycleDeadline() {
        NotificationRepository notifications = mock(NotificationRepository.class);
        EmployeeDetailsRepository employees = mock(EmployeeDetailsRepository.class);
        UserAccountRepository accounts = mock(UserAccountRepository.class);
        EmployeeAcrStatusRepository statuses = mock(EmployeeAcrStatusRepository.class);
        AcrCycleRepository cycles = mock(AcrCycleRepository.class);
        LookupService lookup = mock(LookupService.class);

        when(cycles.findFirstByIsOpenTrueOrderByDueDateDesc()).thenReturn(Optional.of(
                AcrCycle.builder().assessmentYear("2026-2027")
                        .dueDate(LocalDate.now(ZoneId.of("Asia/Kolkata")).minusDays(1)).isOpen(true).build()));

        NotificationService service = new NotificationService(
                notifications, employees, accounts, statuses, cycles, lookup);

        assertThrows(BadRequestException.class, () -> service.sendReminders(List.of(11L), 99L));
        verify(notifications, never()).save(any());
        verifyNoInteractions(accounts, employees);
    }

    @Test
    void eligibilityClosesTheCycleAfterItsDueDateEvenIfTheDatabaseFlagIsStillOpen() {
        NotificationRepository notifications = mock(NotificationRepository.class);
        EmployeeDetailsRepository employees = mock(EmployeeDetailsRepository.class);
        UserAccountRepository accounts = mock(UserAccountRepository.class);
        EmployeeAcrStatusRepository statuses = mock(EmployeeAcrStatusRepository.class);
        AcrCycleRepository cycles = mock(AcrCycleRepository.class);
        LookupService lookup = mock(LookupService.class);

        when(cycles.findFirstByIsOpenTrueOrderByDueDateDesc()).thenReturn(Optional.of(
                AcrCycle.builder().assessmentYear("2026-2027")
                        .dueDate(LocalDate.now(ZoneId.of("Asia/Kolkata")).minusDays(1)).isOpen(true).build()));
        when(notifications.existsByRecipientEmployeeIdAndTypeAndAssessmentYear(
                11L, "APAR_REMINDER", "2026-2027")).thenReturn(true);

        NotificationService service = new NotificationService(
                notifications, employees, accounts, statuses, cycles, lookup);

        var eligibility = service.eligibility(11L);
        assertFalse(eligibility.cycleOpen());
        assertFalse(eligibility.canSubmit());
    }

    @Test
    void remindersAreNotSentToEmployeesWhoAlreadySubmitted() {
        NotificationRepository notifications = mock(NotificationRepository.class);
        EmployeeDetailsRepository employees = mock(EmployeeDetailsRepository.class);
        UserAccountRepository accounts = mock(UserAccountRepository.class);
        EmployeeAcrStatusRepository statuses = mock(EmployeeAcrStatusRepository.class);
        AcrCycleRepository cycles = mock(AcrCycleRepository.class);
        LookupService lookup = mock(LookupService.class);

        when(cycles.findFirstByIsOpenTrueOrderByDueDateDesc()).thenReturn(Optional.of(
                AcrCycle.builder().assessmentYear("2025-2026")
                        .dueDate(LocalDate.now(ZoneId.of("Asia/Kolkata")).plusDays(7)).isOpen(true).build()));
        when(accounts.findAll()).thenReturn(List.of(
                UserAccount.builder().employeeId(11L).role(Role.EMPLOYEE).isActive(true).build()));
        when(employees.findByIsActiveTrue()).thenReturn(List.of(
                EmployeeDetails.builder().employeeId(11L).isActive(true).build()));
        when(statuses.findByEmployeeIdAndAssessmentYear(11L, "2025-2026")).thenReturn(Optional.of(
                EmployeeAcrStatus.builder().employeeId(11L).assessmentYear("2025-2026")
                        .isAcrSubmitted(true).build()));

        NotificationService service = new NotificationService(
                notifications, employees, accounts, statuses, cycles, lookup);

        assertThrows(BadRequestException.class, () -> service.sendReminders(List.of(11L), 99L));
        verify(notifications, never()).save(any());
    }
}
