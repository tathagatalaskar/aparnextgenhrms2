package gov.nic.apar.repository;

import gov.nic.apar.entity.EmployeeDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface EmployeeDetailsRepository extends JpaRepository<EmployeeDetails, Long> {
    List<EmployeeDetails> findAllByOrderByEmployeeIdAsc();
    Optional<EmployeeDetails> findByEmployeeId(Long employeeId);
    List<EmployeeDetails> findByIsActiveTrue();
    List<EmployeeDetails> findByDepartmentIdAndIsActiveTrue(Long departmentId);
}
