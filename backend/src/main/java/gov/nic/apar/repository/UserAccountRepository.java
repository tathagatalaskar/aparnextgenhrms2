package gov.nic.apar.repository;

import gov.nic.apar.entity.Role;
import gov.nic.apar.entity.UserAccount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserAccountRepository extends JpaRepository<UserAccount, Long> {
    Optional<UserAccount> findByEmail(String email);
    List<UserAccount> findAllByEmployeeId(Long employeeId);
    boolean existsByEmployeeIdAndRole(Long employeeId, Role role);
    void deleteAllByEmployeeId(Long employeeId);
}
