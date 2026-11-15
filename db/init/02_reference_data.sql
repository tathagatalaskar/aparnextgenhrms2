-- Production reference data required by employee registration and directory forms.
-- Safe to run after 01_schema.sql and before optional local demo data.
INSERT INTO tran.organization (organization_id, organization_name) VALUES
    (1, 'National Informatics Centre'),
    (2, 'Ministry of Electronics & IT (MeitY)')
ON CONFLICT (organization_id) DO NOTHING;

INSERT INTO tran.office (office_id, organization_id, office_name) VALUES
    (101, 1, 'NIC Tripura State Centre, Agartala'),
    (102, 1, 'NIC Headquarters, New Delhi')
ON CONFLICT (office_id) DO NOTHING;

INSERT INTO tran.department (department_id, department_name) VALUES
    (10, 'e-Governance Division'),
    (20, 'Software Development Division'),
    (30, 'Network & Infrastructure Division'),
    (40, 'Administration & HR')
ON CONFLICT (department_id) DO NOTHING;
