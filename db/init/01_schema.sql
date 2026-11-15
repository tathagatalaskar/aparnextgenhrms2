-- ═══════════════════════════════════════════════════════════════════════
-- APAR / ACR MANAGEMENT — DATABASE SCHEMA
-- Schema: tran  (matches NIC SPARROW table design provided by faculty)
-- PostgreSQL 16
-- ═══════════════════════════════════════════════════════════════════════
SET client_min_messages TO WARNING;

-- Faculty instruction: create schema first
CREATE SCHEMA IF NOT EXISTS tran;

-- Sequence for new employee IDs (self-registration / authority-added).
-- Starts above the seeded 81xxx demo IDs to avoid collisions.
CREATE SEQUENCE IF NOT EXISTS tran.employee_id_seq START WITH 90001 INCREMENT BY 1;

-- ───────────────────────────────────────────────────────────────────────
-- LOOKUP / MASTER TABLES  (normalised reference data — government practice)
-- These give meaning to organization_id / office_id / department_id.
-- ───────────────────────────────────────────────────────────────────────
CREATE TABLE tran.organization (
    organization_id   numeric(5,0) PRIMARY KEY,
    organization_name varchar(150) NOT NULL
);

CREATE TABLE tran.office (
    office_id         numeric(5,0) PRIMARY KEY,
    organization_id   numeric(5,0) REFERENCES tran.organization(organization_id),
    office_name       varchar(150) NOT NULL
);

CREATE TABLE tran.department (
    department_id     numeric(5,0) PRIMARY KEY,
    department_name   varchar(150) NOT NULL
);

-- ───────────────────────────────────────────────────────────────────────
-- EMPLOYEE_DETAILS  (faculty-provided design — the master roll of officers)
-- This is the "directory" of all government employees.
-- ───────────────────────────────────────────────────────────────────────
CREATE TABLE tran.employee_details
(
    employee_id      numeric(10,0) NOT NULL,
    organization_id  numeric(5,0),
    office_id        numeric(5,0),
    department_id    numeric(5,0),
    emp_ini_name     character varying(30),   -- title / initials e.g. 'Shri', 'Smt', 'Dr'
    emp_first_name   character varying(100),
    emp_mid_name     character varying(30),
    emp_last_name    character varying(30),
    gender           character varying(1),    -- 'M' or 'F'
    date_of_birth    date,
    mobile_number    character varying,
    email            character varying(150),   -- contact email (login email lives in user_account)
    designation      character varying(120),
    joining_date     date,
    is_active        boolean NOT NULL DEFAULT TRUE,
    CONSTRAINT employee_details_pk_2 PRIMARY KEY (employee_id),
    CONSTRAINT chk_gender CHECK (gender IN ('M','F')),
    CONSTRAINT fk_emp_org  FOREIGN KEY (organization_id) REFERENCES tran.organization(organization_id),
    CONSTRAINT fk_emp_off  FOREIGN KEY (office_id)        REFERENCES tran.office(office_id),
    CONSTRAINT fk_emp_dept FOREIGN KEY (department_id)    REFERENCES tran.department(department_id)
);
CREATE INDEX idx_emp_dept ON tran.employee_details(department_id);
CREATE INDEX idx_emp_name ON tran.employee_details(emp_first_name);

-- ───────────────────────────────────────────────────────────────────────
-- USER_ACCOUNT  (login credentials — kept separate from HR master data)
-- Links a login (email + password + role) to an employee_id.
-- ───────────────────────────────────────────────────────────────────────
CREATE TABLE tran.user_account (
    account_id     bigserial PRIMARY KEY,
    employee_id    numeric(10,0) NOT NULL REFERENCES tran.employee_details(employee_id),
    email          varchar(150) NOT NULL UNIQUE,
    password_hash  varchar(100) NOT NULL,
    role           varchar(20)  NOT NULL CHECK (role IN ('EMPLOYEE','AUTHORITY')),
    is_active      boolean      NOT NULL DEFAULT TRUE,
    created_at     timestamptz  NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_acc_emp ON tran.user_account(employee_id);

-- ───────────────────────────────────────────────────────────────────────
-- EMPLOYEE_ACR_STATUS  (faculty-provided design + review columns added)
-- One row per employee per assessment year: tracks submission & review.
-- ───────────────────────────────────────────────────────────────────────
CREATE TABLE tran.employee_acr_status
(
    _id              bigserial,
    employee_id      numeric(10,0) NOT NULL,
    organization_id  numeric(5,0),
    office_id        numeric(5,0),
    department_id    numeric(5,0),
    emp_ini_name     character varying(30),
    emp_first_name   character varying(100),
    emp_mid_name     character varying(30),
    emp_last_name    character varying(30),
    assessment_year  character varying(9) NOT NULL,
    is_acr_submitted boolean DEFAULT false,
    -- review columns added for the Authority workflow
    grade            character varying(20),
    authority_remarks text,
    is_flagged       boolean NOT NULL DEFAULT false,
    flag_reason      text,
    reviewed_by      numeric(10,0),
    submitted_at     timestamptz,
    reviewed_at      timestamptz,
    CONSTRAINT employee_acr_status_pkey PRIMARY KEY (_id),
    CONSTRAINT uq_acr_status UNIQUE (employee_id, assessment_year),
    CONSTRAINT fk_status_emp FOREIGN KEY (employee_id) REFERENCES tran.employee_details(employee_id)
)
TABLESPACE pg_default;
CREATE INDEX idx_status_emp  ON tran.employee_acr_status(employee_id);
CREATE INDEX idx_status_flag ON tran.employee_acr_status(is_flagged) WHERE is_flagged = TRUE;

-- ───────────────────────────────────────────────────────────────────────
-- EMPLOYEE_ACR_DETAILS  (faculty-provided design — the target/achievement rows)
-- ───────────────────────────────────────────────────────────────────────
CREATE TABLE tran.employee_acr_details
(
    _id              bigserial,
    employee_id      numeric(10,0) NOT NULL,
    organisation_id  numeric,
    office_id        numeric,
    department_id    numeric,
    assessment_year  character varying(9),
    target           text COLLATE pg_catalog."default",
    achievements     text COLLATE pg_catalog."default",
    sequence_order   smallint,
    CONSTRAINT employee_acr_details_pkey PRIMARY KEY (_id),
    CONSTRAINT fk_details_emp FOREIGN KEY (employee_id) REFERENCES tran.employee_details(employee_id)
)
TABLESPACE pg_default;
CREATE INDEX idx_details_emp ON tran.employee_acr_details(employee_id);

-- ───────────────────────────────────────────────────────────────────────
-- ACR_CYCLE  (defines each assessment year's submission window & due date)
-- ───────────────────────────────────────────────────────────────────────
CREATE TABLE tran.acr_cycle (
    assessment_year  varchar(9) PRIMARY KEY,
    due_date         date NOT NULL,
    is_open          boolean NOT NULL DEFAULT TRUE
);
-- The application assumes one active reporting cycle at a time.
CREATE UNIQUE INDEX uq_acr_cycle_single_open
    ON tran.acr_cycle (is_open)
    WHERE is_open = TRUE;

-- ───────────────────────────────────────────────────────────────────────
-- NOTIFICATION  (manual messages + automatic APAR reminders + announcements)
-- One row per recipient — so each employee only ever sees their own.
-- ───────────────────────────────────────────────────────────────────────
CREATE TABLE tran.notification (
    _id                   bigserial PRIMARY KEY,
    recipient_employee_id numeric(10,0) NOT NULL REFERENCES tran.employee_details(employee_id),
    sender_employee_id    numeric(10,0),                 -- null = system-generated
    type                  varchar(20) NOT NULL,          -- MANUAL / APAR_REMINDER / ANNOUNCEMENT
    title                 varchar(150) NOT NULL,
    message               text NOT NULL,
    assessment_year       varchar(9),                    -- set for APAR reminders (dedupe per cycle)
    is_read               boolean NOT NULL DEFAULT FALSE,
    created_at            timestamptz NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_notif_type CHECK (type IN ('MANUAL','APAR_REMINDER','ANNOUNCEMENT'))
);
CREATE INDEX idx_notif_recipient ON tran.notification(recipient_employee_id, is_read);
CREATE INDEX idx_notif_dedupe ON tran.notification(recipient_employee_id, type, assessment_year);
