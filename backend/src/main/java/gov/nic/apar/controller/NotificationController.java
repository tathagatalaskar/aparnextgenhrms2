package gov.nic.apar.controller;

import gov.nic.apar.dto.*;
import gov.nic.apar.security.AppUserDetails;
import gov.nic.apar.service.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/** Notifications + APAR reminders. Prefix: /api/v1/notifications */
@RestController
@RequestMapping("/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    // ── Employee: own notification center ──
    @GetMapping
    public List<NotificationView> list(@AuthenticationPrincipal AppUserDetails me) {
        return notificationService.listFor(me.getAccount().getEmployeeId());
    }

    @GetMapping("/unread-count")
    public Map<String, Long> unread(@AuthenticationPrincipal AppUserDetails me) {
        return Map.of("count", notificationService.unreadCount(me.getAccount().getEmployeeId()));
    }

    @PatchMapping("/{id}/read")
    public void markRead(@PathVariable Long id, @AuthenticationPrincipal AppUserDetails me) {
        notificationService.markRead(id, me.getAccount().getEmployeeId());
    }

    @PatchMapping("/read-all")
    public void markAllRead(@AuthenticationPrincipal AppUserDetails me) {
        notificationService.markAllRead(me.getAccount().getEmployeeId());
    }

    // ── Authority: send a manual notification ──
    @PostMapping("/send")
    @PreAuthorize("hasRole('AUTHORITY')")
    public MessageResponse send(@Valid @RequestBody SendNotificationRequest req,
                                @AuthenticationPrincipal AppUserDetails me) {
        return notificationService.sendManual(req, me.getAccount().getEmployeeId());
    }

    // ── Authority: send APAR reminders to selected employees (unlocks their form) ──
    @PostMapping("/reminders")
    @PreAuthorize("hasRole('AUTHORITY')")
    public MessageResponse reminders(@Valid @RequestBody SendReminderRequest req,
                                     @AuthenticationPrincipal AppUserDetails me) {
        return notificationService.sendReminders(req.employeeIds(), me.getAccount().getEmployeeId());
    }

    // ── Authority: run the automatic reminder sweep now (also runs on a daily schedule) ──
    @PostMapping("/reminders/auto")
    @PreAuthorize("hasRole('AUTHORITY')")
    public MessageResponse autoReminders() {
        int n = notificationService.generateAutoReminders();
        return new MessageResponse("Automatic reminders generated: " + n);
    }

    // ── Authority: employees who haven't submitted yet ──
    @GetMapping("/pending")
    @PreAuthorize("hasRole('AUTHORITY')")
    public List<PendingReportView> pending() {
        return notificationService.pendingReports();
    }
}
