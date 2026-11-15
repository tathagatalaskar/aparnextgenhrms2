package gov.nic.apar.controller;

import gov.nic.apar.entity.Department;
import gov.nic.apar.entity.Office;
import gov.nic.apar.repository.DepartmentRepository;
import gov.nic.apar.repository.OfficeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Public reference data for forms (e.g. the registration dropdown). */
@RestController
@RequestMapping("/v1/meta")
@RequiredArgsConstructor
public class MetaController {

    private final DepartmentRepository departmentRepository;
    private final OfficeRepository officeRepository;

    @GetMapping("/departments")
    public List<Department> departments() {
        return departmentRepository.findAll();
    }

    @GetMapping("/offices")
    public List<Office> offices() {
        return officeRepository.findAll();
    }
}
