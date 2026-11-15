package gov.nic.apar.entity;

import jakarta.persistence.*;
import lombok.*;

/** One target/achievement row of an ACR. Maps to tran.employee_acr_details. */
@Entity
@Table(name = "employee_acr_details")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EmployeeAcrDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "_id")
    private Long id;

    @Column(name = "employee_id", nullable = false)
    private Long employeeId;

    @Column(name = "organisation_id")
    private Long organisationId;

    @Column(name = "office_id")
    private Long officeId;

    @Column(name = "department_id")
    private Long departmentId;

    @Column(name = "assessment_year", length = 9)
    private String assessmentYear;

    @Column(columnDefinition = "text")
    private String target;

    @Column(columnDefinition = "text")
    private String achievements;

    @Column(name = "sequence_order")
    private Short sequenceOrder;
}
