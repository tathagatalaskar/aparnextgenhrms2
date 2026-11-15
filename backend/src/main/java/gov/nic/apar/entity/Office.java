package gov.nic.apar.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "office")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Office {
    @Id
    @Column(name = "office_id")
    private Long officeId;

    @Column(name = "organization_id")
    private Long organizationId;

    @Column(name = "office_name", nullable = false)
    private String officeName;
}
