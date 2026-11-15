package gov.nic.apar.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "organization")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Organization {
    @Id
    @Column(name = "organization_id")
    private Long organizationId;

    @Column(name = "organization_name", nullable = false)
    private String organizationName;
}
