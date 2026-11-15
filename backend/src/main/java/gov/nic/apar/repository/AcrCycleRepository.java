package gov.nic.apar.repository;

import gov.nic.apar.entity.AcrCycle;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface AcrCycleRepository extends JpaRepository<AcrCycle, String> {
    Optional<AcrCycle> findFirstByIsOpenTrueOrderByDueDateDesc();
}
