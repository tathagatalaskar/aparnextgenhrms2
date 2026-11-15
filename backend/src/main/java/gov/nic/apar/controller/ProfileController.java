package gov.nic.apar.controller;

import gov.nic.apar.dto.EmployeeView;
import gov.nic.apar.dto.UpdateProfileRequest;
import gov.nic.apar.security.AppUserDetails;
import gov.nic.apar.service.EmployeeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/** The logged-in employee's own profile. Prefix: /api/v1/me */
@RestController
@RequestMapping("/v1/me")
@RequiredArgsConstructor
public class ProfileController {

    private final EmployeeService employeeService;

    @GetMapping
    public EmployeeView myProfile(@AuthenticationPrincipal AppUserDetails me) {
        return employeeService.getOne(me.getAccount().getEmployeeId());
    }

    @PutMapping
    public EmployeeView updateProfile(@Valid @RequestBody UpdateProfileRequest req,
                                      @AuthenticationPrincipal AppUserDetails me) {
        return employeeService.updateProfile(me.getAccount().getEmployeeId(), req);
    }
}
