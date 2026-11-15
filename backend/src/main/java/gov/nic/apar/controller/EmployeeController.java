package gov.nic.apar.controller;

import gov.nic.apar.dto.*;
import gov.nic.apar.security.AppUserDetails;
import gov.nic.apar.service.EmployeeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Authority-only employee management. Prefix: /api/v1/employees */
@RestController
@RequestMapping("/v1/employees")
@RequiredArgsConstructor
@PreAuthorize("hasRole('AUTHORITY')")
public class EmployeeController {

    private final EmployeeService employeeService;

    @GetMapping
    public List<EmployeeView> list() {
        return employeeService.listAll();
    }

    @GetMapping("/{employeeId}")
    public EmployeeView get(@PathVariable Long employeeId) {
        return employeeService.getOne(employeeId);
    }

    @PostMapping
    public EmployeeView add(@Valid @RequestBody AddEmployeeRequest req) {
        return employeeService.addEmployee(req);
    }

    @PutMapping("/{employeeId}")
    public EmployeeView update(@PathVariable Long employeeId, @Valid @RequestBody UpdateEmployeeRequest req) {
        return employeeService.updateEmployee(employeeId, req);
    }

    @PatchMapping("/{employeeId}/active")
    public EmployeeView setActive(@PathVariable Long employeeId, @RequestParam boolean active,
                                  @AuthenticationPrincipal AppUserDetails me) {
        return employeeService.setActive(employeeId, active, me.getAccount().getEmployeeId());
    }

    @DeleteMapping("/{employeeId}")
    public ResponseEntity<Void> delete(@PathVariable Long employeeId) {
        employeeService.deleteEmployee(employeeId);
        return ResponseEntity.noContent().build();
    }
}
