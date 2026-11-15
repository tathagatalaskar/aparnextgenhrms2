package gov.nic.apar.service;

import gov.nic.apar.entity.Department;
import gov.nic.apar.entity.Office;
import gov.nic.apar.entity.Organization;
import gov.nic.apar.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/** Caches lookup name maps so we can show names instead of IDs. */
@Service
@RequiredArgsConstructor
public class LookupService {

    private final OrganizationRepository organizationRepository;
    private final OfficeRepository officeRepository;
    private final DepartmentRepository departmentRepository;

    public Map<Long, String> organizations() {
        return organizationRepository.findAll().stream()
                .collect(Collectors.toMap(Organization::getOrganizationId, Organization::getOrganizationName));
    }

    public Map<Long, String> offices() {
        return officeRepository.findAll().stream()
                .collect(Collectors.toMap(Office::getOfficeId, Office::getOfficeName));
    }

    public Map<Long, String> departments() {
        return departmentRepository.findAll().stream()
                .collect(Collectors.toMap(Department::getDepartmentId, Department::getDepartmentName));
    }

    public String nameOr(Map<Long, String> map, Long key) {
        if (key == null) return null;
        return map.getOrDefault(key, String.valueOf(key));
    }
}
