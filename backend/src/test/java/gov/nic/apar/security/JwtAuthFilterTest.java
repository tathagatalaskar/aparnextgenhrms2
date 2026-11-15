package gov.nic.apar.security;

import gov.nic.apar.entity.Role;
import gov.nic.apar.entity.UserAccount;
import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.security.core.context.SecurityContextHolder;

import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.*;

class JwtAuthFilterTest {

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void deactivatedAccountCannotUseAnAlreadyIssuedJwt() throws Exception {
        JwtService jwtService = mock(JwtService.class);
        AppUserDetailsService userDetailsService = mock(AppUserDetailsService.class);
        UserAccount disabledAccount = UserAccount.builder()
                .employeeId(81851L)
                .email("employee@nic.in")
                .role(Role.EMPLOYEE)
                .isActive(false)
                .build();

        when(jwtService.extractEmail("valid-token")).thenReturn("employee@nic.in");
        when(userDetailsService.loadUserByUsername("employee@nic.in"))
                .thenReturn(new AppUserDetails(disabledAccount));

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer valid-token");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = new MockFilterChain();

        new JwtAuthFilter(jwtService, userDetailsService).doFilter(request, response, chain);

        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verify(jwtService, never()).isValid(anyString(), anyString());
    }
}
