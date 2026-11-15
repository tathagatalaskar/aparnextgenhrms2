package gov.nic.apar.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;

/** A single notification for one recipient. Maps to tran.notification. */
@Entity
@Table(name = "notification")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "_id")
    private Long id;

    @Column(name = "recipient_employee_id", nullable = false)
    private Long recipientEmployeeId;

    @Column(name = "sender_employee_id")
    private Long senderEmployeeId;     // null = system generated

    @Column(nullable = false, length = 20)
    private String type;               // MANUAL / APAR_REMINDER / ANNOUNCEMENT

    @Column(nullable = false, length = 150)
    private String title;

    @Column(nullable = false, columnDefinition = "text")
    private String message;

    @Column(name = "assessment_year", length = 9)
    private String assessmentYear;     // set for APAR reminders

    @Column(name = "is_read", nullable = false)
    @Builder.Default
    private Boolean isRead = false;

    @Column(name = "created_at", nullable = false, updatable = false, insertable = false)
    private OffsetDateTime createdAt;
}
