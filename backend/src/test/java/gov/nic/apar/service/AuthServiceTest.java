package gov.nic.apar.service;

import gov.nic.apar.dto.LoginRequest;
import gov.nic.apar.dto.LoginResponse;
import gov.nic.apar.entity.EmployeeDetails;
import gov.nic.apar.entity.Role;
import gov.nic.apar.entity.UserAccount;
import gov.nic.apar.repository.EmployeeDetailsRepository;
import gov.nic.apar.repository.UserAccountRepository;
import gov.nic.apar.security.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.Authentication;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class AuthServiceTest {

    @Test
    void loginNormalizesEmailBeforeAuthenticationAndLookup() {
        AuthenticationManager authManager = mock(AuthenticationManager.class);
        JwtService jwtService = mock(JwtService.class);
        UserAccountRepository accounts = mock(UserAccountRepository.class);
        EmployeeDetailsRepository employees = mock(EmployeeDetailsRepository.class);

        UserAccount account = UserAccount.builder()
                .employeeId(81851L)
                .email("employee@nic.in")
                .role(Role.EMPLOYEE)
                .isActive(true)
                .build();
        EmployeeDetails employee = EmployeeDetails.builder()
                .employeeId(81851L)
                .empIniName("Shri")
                .empFirstName("Tathagata")
                .empLastName("Laskar")
                .build();

        when(accounts.findByEmail("employee@nic.in")).thenReturn(Optional.of(account));
        when(employees.findByEmployeeId(81851L)).thenReturn(Optional.of(employee));
        when(jwtService.generateToken(eq("employee@nic.in"), anyMap())).thenReturn("signed-token");

        AuthService service = new AuthService(authManager, jwtService, accounts, employees);
        LoginResponse response = service.login(new LoginRequest("  Employee@NIC.IN ", "secret"));

        assertEquals("signed-token", response.token());
        assertEquals("employee@nic.in", response.email());
        assertEquals("EMPLOYEE", response.role());
        assertEquals("Shri Tathagata Laskar", response.fullName());

        org.mockito.ArgumentCaptor<Authentication> authentication =
                org.mockito.ArgumentCaptor.forClass(Authentication.class);
        verify(authManager).authenticate(authentication.capture());
        assertEquals("employee@nic.in", authentication.getValue().getName());
        assertEquals("secret", authentication.getValue().getCredentials());
        verify(accounts).findByEmail("employee@nic.in");
    }
}
