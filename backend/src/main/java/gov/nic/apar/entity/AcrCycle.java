package gov.nic.apar.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

/** The assessment cycle window. Maps to tran.acr_cycle. */
@Entity
@Table(name = "acr_cycle")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AcrCycle {

    @Id
    @Column(name = "assessment_year", length = 9)
    private String assessmentYear;

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @Column(name = "is_open", nullable = false)
    @Builder.Default
    private Boolean isOpen = true;
}
