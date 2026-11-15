package gov.nic.apar.repository;

import gov.nic.apar.entity.EmployeeAcrStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface EmployeeAcrStatusRepository extends JpaRepository<EmployeeAcrStatus, Long> {
    Optional<EmployeeAcrStatus> findByEmployeeIdAndAssessmentYear(Long employeeId, String assessmentYear);
    List<EmployeeAcrStatus> findByEmployeeIdOrderByAssessmentYearDesc(Long employeeId);
    List<EmployeeAcrStatus> findAllByOrderBySubmittedAtDesc();
}
