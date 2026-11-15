package gov.nic.apar.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;

/** ACR submission + review status per employee per year. Maps to tran.employee_acr_status. */
@Entity
@Table(name = "employee_acr_status")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EmployeeAcrStatus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "_id")
    private Long id;

    @Column(name = "employee_id", nullable = false)
    private Long employeeId;

    @Column(name = "organization_id")
    private Long organizationId;

    @Column(name = "office_id")
    private Long officeId;

    @Column(name = "department_id")
    private Long departmentId;

    @Column(name = "emp_ini_name", length = 30)
    private String empIniName;

    @Column(name = "emp_first_name", length = 100)
    private String empFirstName;

    @Column(name = "emp_mid_name", length = 30)
    private String empMidName;

    @Column(name = "emp_last_name", length = 30)
    private String empLastName;

    @Column(name = "assessment_year", nullable = false, length = 9)
    private String assessmentYear;

    @Column(name = "is_acr_submitted")
    @Builder.Default
    private Boolean isAcrSubmitted = false;

    @Column(length = 20)
    private String grade;

    @Column(name = "authority_remarks", columnDefinition = "text")
    private String authorityRemarks;

    @Column(name = "is_flagged", nullable = false)
    @Builder.Default
    private Boolean isFlagged = false;

    @Column(name = "flag_reason", columnDefinition = "text")
    private String flagReason;

    @Column(name = "reviewed_by")
    private Long reviewedBy;

    @Column(name = "submitted_at")
    private OffsetDateTime submittedAt;

    @Column(name = "reviewed_at")
    private OffsetDateTime reviewedAt;
}
