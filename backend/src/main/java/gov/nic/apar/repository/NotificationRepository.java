package gov.nic.apar.repository;

import gov.nic.apar.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipientEmployeeIdOrderByCreatedAtDesc(Long recipientEmployeeId);
    long countByRecipientEmployeeIdAndIsReadFalse(Long recipientEmployeeId);
    boolean existsByRecipientEmployeeIdAndTypeAndAssessmentYear(Long recipientEmployeeId, String type, String assessmentYear);
    void deleteByRecipientEmployeeId(Long recipientEmployeeId);
}
