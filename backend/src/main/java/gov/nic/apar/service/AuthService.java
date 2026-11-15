package gov.nic.apar.service;

import gov.nic.apar.dto.LoginRequest;
import gov.nic.apar.dto.LoginResponse;
import gov.nic.apar.entity.EmployeeDetails;
import gov.nic.apar.entity.UserAccount;
import gov.nic.apar.exception.NotFoundException;
import gov.nic.apar.repository.EmployeeDetailsRepository;
import gov.nic.apar.repository.UserAccountRepository;
import gov.nic.apar.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authManager;
    private final JwtService jwtService;
    private final UserAccountRepository accountRepository;
    private final EmployeeDetailsRepository employeeRepository;

    public LoginResponse login(LoginRequest req) {
        String email = req.email().trim().toLowerCase(Locale.ROOT);
        authManager.authenticate(new UsernamePasswordAuthenticationToken(email, req.password()));

        UserAccount account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Account not found"));
        EmployeeDetails emp = employeeRepository.findByEmployeeId(account.getEmployeeId())
                .orElseThrow(() -> new NotFoundException("Employee record not found"));

        String token = jwtService.generateToken(account.getEmail(), Map.of(
                "role", account.getRole().name(),
                "eid", account.getEmployeeId(),
                "name", emp.getFullName()));

        return new LoginResponse(token, account.getEmployeeId(), emp.getFullName(),
                account.getEmail(), account.getRole().name());
    }
}
