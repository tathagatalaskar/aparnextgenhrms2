package gov.nic.apar.service;

import gov.nic.apar.dto.*;
import gov.nic.apar.entity.*;
import gov.nic.apar.repository.EmployeeAcrDetailRepository;
import gov.nic.apar.repository.EmployeeDetailsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class AcrMapper {

    private final EmployeeDetailsRepository employeeRepository;
    private final EmployeeAcrDetailRepository detailRepository;
    private final LookupService lookup;

    public EmployeeView toEmployeeView(EmployeeDetails e,
                                       Map<Long, String> orgs,
                                       Map<Long, String> offices,
                                       Map<Long, String> depts) {
        return new EmployeeView(
                e.getEmployeeId(), e.getFullName(),
                e.getEmpIniName(), e.getEmpFirstName(), e.getEmpMidName(), e.getEmpLastName(),
                e.getGender(), e.getDateOfBirth(),
                e.getDepartmentId(), lookup.nameOr(depts, e.getDepartmentId()),
                e.getOfficeId(), lookup.nameOr(offices, e.getOfficeId()),
                e.getDesignation(), e.getJoiningDate(), e.getEmail(), e.getMobileNumber(),
                Boolean.TRUE.equals(e.getIsActive()));
    }

    public AcrSummaryView toSummary(EmployeeAcrStatus s, Map<Long, String> depts) {
        String name = composeName(s.getEmpIniName(), s.getEmpFirstName(), s.getEmpMidName(), s.getEmpLastName());
        return new AcrSummaryView(
                s.getId(), s.getEmployeeId(), name,
                lookup.nameOr(depts, s.getDepartmentId()),
                s.getAssessmentYear(),
                Boolean.TRUE.equals(s.getIsAcrSubmitted()),
                s.getReviewedAt() != null,
                Boolean.TRUE.equals(s.getIsFlagged()),
                s.getGrade(),
                s.getSubmittedAt());
    }

    public AcrDetailView toDetail(EmployeeAcrStatus s) {
        Map<Long, String> depts = lookup.departments();
        Map<Long, String> offices = lookup.offices();

        List<AcrTargetView> targets = detailRepository
                .findByEmployeeIdAndAssessmentYearOrderBySequenceOrderAsc(s.getEmployeeId(), s.getAssessmentYear())
                .stream()
                .map(d -> new AcrTargetView(d.getTarget(), d.getAchievements(), d.getSequenceOrder()))
                .toList();

        EmployeeDetails emp = employeeRepository.findByEmployeeId(s.getEmployeeId()).orElse(null);
        String gender = emp != null ? emp.getGender() : null;
        var dob = emp != null ? emp.getDateOfBirth() : null;

        String reviewerName = null;
        if (s.getReviewedBy() != null) {
            reviewerName = employeeRepository.findByEmployeeId(s.getReviewedBy())
                    .map(EmployeeDetails::getFullName).orElse(null);
        }

        String name = composeName(s.getEmpIniName(), s.getEmpFirstName(), s.getEmpMidName(), s.getEmpLastName());

        return new AcrDetailView(
                s.getId(), s.getEmployeeId(), name, gender, dob,
                lookup.nameOr(depts, s.getDepartmentId()),
                lookup.nameOr(offices, s.getOfficeId()),
                s.getAssessmentYear(),
                Boolean.TRUE.equals(s.getIsAcrSubmitted()),
                s.getGrade(), s.getAuthorityRemarks(),
                Boolean.TRUE.equals(s.getIsFlagged()), s.getFlagReason(),
                reviewerName, targets, s.getSubmittedAt(), s.getReviewedAt());
    }

    private String composeName(String ini, String first, String mid, String last) {
        StringBuilder sb = new StringBuilder();
        if (ini != null && !ini.isBlank()) sb.append(ini).append(' ');
        if (first != null) sb.append(first).append(' ');
        if (mid != null && !mid.isBlank()) sb.append(mid).append(' ');
        if (last != null) sb.append(last);
        return sb.toString().trim();
    }
}
