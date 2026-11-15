package gov.nic.apar.service;

import gov.nic.apar.dto.RegisterRequest;
import gov.nic.apar.entity.EmployeeDetails;
import gov.nic.apar.entity.Role;
import gov.nic.apar.entity.UserAccount;
import gov.nic.apar.repository.*;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class EmployeeServiceTest {

    @Test
    void selfRegistrationCreatesAnInactiveAccountPendingApproval() {
        EmployeeDetailsRepository employees = mock(EmployeeDetailsRepository.class);
        UserAccountRepository accounts = mock(UserAccountRepository.class);
        EmployeeAcrStatusRepository statuses = mock(EmployeeAcrStatusRepository.class);
        EmployeeAcrDetailRepository details = mock(EmployeeAcrDetailRepository.class);
        NotificationRepository notifications = mock(NotificationRepository.class);
        PasswordEncoder passwords = mock(PasswordEncoder.class);
        NotificationService notificationService = mock(NotificationService.class);
        AcrMapper mapper = mock(AcrMapper.class);
        LookupService lookup = mock(LookupService.class);

        when(accounts.findByEmail("new.employee@nic.in")).thenReturn(Optional.empty());
        when(employees.save(any(EmployeeDetails.class))).thenAnswer(invocation -> {
            EmployeeDetails employee = invocation.getArgument(0);
            employee.setEmployeeId(90001L);
            return employee;
        });
        when(passwords.encode("SecurePass123")).thenReturn("bcrypt-hash");

        EmployeeService service = new EmployeeService(
                employees, accounts, statuses, details, notifications,
                passwords, notificationService, mapper, lookup);

        RegisterRequest request = new RegisterRequest(
                " New.Employee@NIC.IN ", "SecurePass123", "Shri", "New", null, "Employee",
                "M", LocalDate.of(1990, 1, 1), 10L, "Officer", "9436123456");

        var response = service.register(request);

        assertTrue(response.message().contains("authority approval"));
        var employeeCaptor = org.mockito.ArgumentCaptor.forClass(EmployeeDetails.class);
        verify(employees).save(employeeCaptor.capture());
        assertFalse(employeeCaptor.getValue().getIsActive());

        var accountCaptor = org.mockito.ArgumentCaptor.forClass(UserAccount.class);
        verify(accounts).save(accountCaptor.capture());
        assertEquals("new.employee@nic.in", accountCaptor.getValue().getEmail());
        assertEquals(Role.EMPLOYEE, accountCaptor.getValue().getRole());
        assertFalse(accountCaptor.getValue().getIsActive());
        assertEquals("bcrypt-hash", accountCaptor.getValue().getPasswordHash());
    }
}
