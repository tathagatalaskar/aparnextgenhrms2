package gov.nic.apar.controller;

import gov.nic.apar.dto.*;
import gov.nic.apar.security.AppUserDetails;
import gov.nic.apar.service.AcrService;
import gov.nic.apar.service.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** ACR endpoints. Prefix: /api/v1/acr */
@RestController
@RequestMapping("/v1/acr")
@RequiredArgsConstructor
public class AcrController {

    private final AcrService acrService;
    private final NotificationService notificationService;

    @GetMapping
    public List<AcrSummaryView> list(@AuthenticationPrincipal AppUserDetails me) {
        return acrService.list(me.getAccount());
    }

    /** Is the APAR form unlocked for the current employee? (gated behind a reminder) */
    @GetMapping("/eligibility")
    public SubmitEligibilityView eligibility(@AuthenticationPrincipal AppUserDetails me) {
        return notificationService.eligibility(me.getAccount().getEmployeeId());
    }

    @GetMapping("/{statusId}")
    public AcrDetailView detail(@PathVariable Long statusId,
                                @AuthenticationPrincipal AppUserDetails me) {
        return acrService.getDetail(statusId, me.getAccount());
    }

    @PostMapping("/submit")
    public ResponseEntity<AcrDetailView> submit(@Valid @RequestBody SubmitAcrRequest req,
                                                @AuthenticationPrincipal AppUserDetails me) {
        return ResponseEntity.status(HttpStatus.CREATED).body(acrService.submit(req, me.getAccount()));
    }

    @PutMapping("/{statusId}/review")
    public AcrDetailView review(@PathVariable Long statusId,
                                @Valid @RequestBody ReviewRequest req,
                                @AuthenticationPrincipal AppUserDetails me) {
        return acrService.review(statusId, req, me.getAccount());
    }
}
