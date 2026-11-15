package gov.nic.apar.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

/** Master roll of government officers — maps to tran.employee_details. */
@Entity
@Table(name = "employee_details")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EmployeeDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "emp_id_gen")
    @SequenceGenerator(name = "emp_id_gen", sequenceName = "employee_id_seq", schema = "tran", allocationSize = 1)
    @Column(name = "employee_id")
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

    @Column(length = 1)
    private String gender;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "mobile_number")
    private String mobileNumber;

    @Column(length = 150)
    private String email;

    @Column(length = 120)
    private String designation;

    @Column(name = "joining_date")
    private LocalDate joiningDate;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    /** Composed display name e.g. "Smt Priya Menon". */
    @Transient
    public String getFullName() {
        StringBuilder sb = new StringBuilder();
        if (empIniName != null && !empIniName.isBlank()) sb.append(empIniName).append(' ');
        if (empFirstName != null) sb.append(empFirstName).append(' ');
        if (empMidName != null && !empMidName.isBlank()) sb.append(empMidName).append(' ');
        if (empLastName != null) sb.append(empLastName);
        return sb.toString().trim();
    }
}
