package gov.nic.apar.dto;

public record LoginResponse(
        String token,
        Long employeeId,
        String fullName,
        String email,
        String role
) {}
