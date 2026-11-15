package gov.nic.apar.repository;

import gov.nic.apar.entity.EmployeeAcrDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EmployeeAcrDetailRepository extends JpaRepository<EmployeeAcrDetail, Long> {
    List<EmployeeAcrDetail> findByEmployeeIdAndAssessmentYearOrderBySequenceOrderAsc(Long employeeId, String assessmentYear);
    void deleteByEmployeeIdAndAssessmentYear(Long employeeId, String assessmentYear);
}
