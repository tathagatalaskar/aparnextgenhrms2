-- LOCAL DEMO SEED DATA ONLY (all seeded passwords = 'Password@123').
-- NEVER apply this file to a production database.

INSERT INTO tran.employee_details
    (employee_id, organization_id, office_id, department_id, emp_ini_name, emp_first_name, emp_mid_name, emp_last_name, gender, date_of_birth, mobile_number, email, designation, joining_date, is_active) VALUES
    (81848, 1, 101, 40, 'Smt', 'Anita', NULL, 'Sharma', 'F', '1979-05-14', '9436120011', 'authority@nic.in', 'Deputy Director (HR)', '2005-06-01', TRUE),
    (81850, 1, 101, 20, 'Shri', 'Rajesh', 'Kumar', 'Debbarma', 'M', '1982-11-02', '9436120022', NULL, 'Director', '2008-03-15', TRUE),
    (81851, 1, 101, 20, 'Shri', 'Tathagata', NULL, 'Laskar', 'M', '2004-08-21', '9436120033', 'employee@nic.in', 'Scientist-B', '2024-07-15', TRUE),
    (81853, 1, 101, 10, 'Smt', 'Priya', NULL, 'Menon', 'F', '1990-03-30', '9436120044', 'priya@nic.in', 'Scientist-B', '2016-08-01', TRUE),
    (81860, 1, 101, 30, 'Shri', 'Sunil', 'Chandra', 'Nath', 'M', '1988-07-19', '9436120055', 'sunil@nic.in', 'Scientist-C', '2012-01-10', TRUE),
    (81862, 1, 101, 10, 'Smt', 'Rebecca', NULL, 'Chakraborty', 'F', '1992-12-05', '9436120066', NULL, 'Scientist-B', '2018-11-20', TRUE);

-- Seeded local demo account password for each account: Password@123
-- The BCrypt hash was generated with Spring Security BCryptPasswordEncoder.
INSERT INTO tran.user_account (employee_id, email, password_hash, role) VALUES
    (81848, 'authority@nic.in', '$2b$10$vttwGAI.2vQgKVYUYyVlcOb6o.hHedni66GTcN3fKgDXPNq0FiWHS', 'AUTHORITY'),
    (81851, 'employee@nic.in', '$2b$10$vttwGAI.2vQgKVYUYyVlcOb6o.hHedni66GTcN3fKgDXPNq0FiWHS', 'EMPLOYEE'),
    (81853, 'priya@nic.in', '$2b$10$vttwGAI.2vQgKVYUYyVlcOb6o.hHedni66GTcN3fKgDXPNq0FiWHS', 'EMPLOYEE'),
    (81860, 'sunil@nic.in', '$2b$10$vttwGAI.2vQgKVYUYyVlcOb6o.hHedni66GTcN3fKgDXPNq0FiWHS', 'EMPLOYEE');

-- Existing sample submission so the Authority can demonstrate assessment.
INSERT INTO tran.employee_acr_status
    (employee_id, organization_id, office_id, department_id, emp_ini_name, emp_first_name, emp_mid_name, emp_last_name,
     assessment_year, is_acr_submitted, submitted_at)
VALUES
    (81853, 1, 101, 10, 'Smt', 'Priya', NULL, 'Menon', '2026-2027', TRUE, NOW());

INSERT INTO tran.employee_acr_details
    (employee_id, organisation_id, office_id, department_id, assessment_year, target, achievements, sequence_order) VALUES
    (81853, 1, 101, 10, '2026-2027', 'Migrate citizen services portal to new stack', 'Completed migration with zero downtime', 1),
    (81853, 1, 101, 10, '2026-2027', 'Mentor two junior developers', 'Both cleared internal certification', 2);

-- The demo cycle is intentionally short to make reminder workflows testable locally.
INSERT INTO tran.acr_cycle (assessment_year, due_date, is_open)
VALUES ('2026-2027', CURRENT_DATE + INTERVAL '7 days', TRUE);

INSERT INTO tran.notification (recipient_employee_id, sender_employee_id, type, title, message, assessment_year)
VALUES (81851, 81848, 'ANNOUNCEMENT', 'Welcome to the APAR Portal',
        'Please review the APAR portal and wait for the Authority to request your submission.',
        '2026-2027');
