package gov.nic.apar.dto;

import java.time.OffsetDateTime;

public record NotificationView(
        Long id,
        String type,
        String title,
        String message,
        boolean read,
        String senderName,
        OffsetDateTime createdAt
) {}
