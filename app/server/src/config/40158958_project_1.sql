--
-- PostgreSQL database dump
--

-- Dumped from database version 18.4 (Homebrew)
-- Dumped by pg_dump version 18.4

-- Started on 2026-07-02 17:43:40 BST

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 882 (class 1247 OID 16432)
-- Name: notification_type; Type: TYPE; Schema: public; Owner: jamesmcnamee
--

CREATE TYPE public.notification_type AS ENUM (
    'query_assigned',
    'query_updated',
    'query_reply'
);


ALTER TYPE public.notification_type OWNER TO jamesmcnamee;

--
-- TOC entry 867 (class 1247 OID 16386)
-- Name: organisation_type; Type: TYPE; Schema: public; Owner: jamesmcnamee
--

CREATE TYPE public.organisation_type AS ENUM (
    'pharmacy',
    'gp_surgery'
);


ALTER TYPE public.organisation_type OWNER TO jamesmcnamee;

--
-- TOC entry 879 (class 1247 OID 16420)
-- Name: query_category; Type: TYPE; Schema: public; Owner: jamesmcnamee
--

CREATE TYPE public.query_category AS ENUM (
    'prescription',
    'stock',
    'patient',
    'routine',
    'other'
);


ALTER TYPE public.query_category OWNER TO jamesmcnamee;

--
-- TOC entry 873 (class 1247 OID 16404)
-- Name: query_priority; Type: TYPE; Schema: public; Owner: jamesmcnamee
--

CREATE TYPE public.query_priority AS ENUM (
    'high',
    'medium',
    'low'
);


ALTER TYPE public.query_priority OWNER TO jamesmcnamee;

--
-- TOC entry 876 (class 1247 OID 16412)
-- Name: query_status; Type: TYPE; Schema: public; Owner: jamesmcnamee
--

CREATE TYPE public.query_status AS ENUM (
    'new',
    'in_progress',
    'awaiting_response',
    'escalated',
    'resolved'
);


ALTER TYPE public.query_status OWNER TO jamesmcnamee;

--
-- TOC entry 870 (class 1247 OID 16392)
-- Name: user_role; Type: TYPE; Schema: public; Owner: jamesmcnamee
--

CREATE TYPE public.user_role AS ENUM (
    'admin',
    'pharmacy_manager',
    'practice_manager',
    'pharmacy_staff',
    'practice_staff'
);


ALTER TYPE public.user_role OWNER TO jamesmcnamee;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 230 (class 1259 OID 16564)
-- Name: audit_log; Type: TABLE; Schema: public; Owner: jamesmcnamee
--

CREATE TABLE public.audit_log (
    id integer NOT NULL,
    user_id integer,
    query_id integer,
    action character varying(255) NOT NULL,
    old_value text,
    new_value text,
    performed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.audit_log OWNER TO jamesmcnamee;

--
-- TOC entry 229 (class 1259 OID 16563)
-- Name: audit_log_id_seq; Type: SEQUENCE; Schema: public; Owner: jamesmcnamee
--

CREATE SEQUENCE public.audit_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.audit_log_id_seq OWNER TO jamesmcnamee;

--
-- TOC entry 3962 (class 0 OID 0)
-- Dependencies: 229
-- Name: audit_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: jamesmcnamee
--

ALTER SEQUENCE public.audit_log_id_seq OWNED BY public.audit_log.id;


--
-- TOC entry 232 (class 1259 OID 16586)
-- Name: notifications; Type: TABLE; Schema: public; Owner: jamesmcnamee
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    user_id integer NOT NULL,
    query_id integer,
    type public.notification_type NOT NULL,
    message text NOT NULL,
    is_read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.notifications OWNER TO jamesmcnamee;

--
-- TOC entry 231 (class 1259 OID 16585)
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: jamesmcnamee
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_id_seq OWNER TO jamesmcnamee;

--
-- TOC entry 3963 (class 0 OID 0)
-- Dependencies: 231
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: jamesmcnamee
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- TOC entry 234 (class 1259 OID 16611)
-- Name: organisation_links; Type: TABLE; Schema: public; Owner: jamesmcnamee
--

CREATE TABLE public.organisation_links (
    id integer NOT NULL,
    pharmacy_id integer NOT NULL,
    gp_surgery_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.organisation_links OWNER TO jamesmcnamee;

--
-- TOC entry 233 (class 1259 OID 16610)
-- Name: organisation_links_id_seq; Type: SEQUENCE; Schema: public; Owner: jamesmcnamee
--

CREATE SEQUENCE public.organisation_links_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.organisation_links_id_seq OWNER TO jamesmcnamee;

--
-- TOC entry 3964 (class 0 OID 0)
-- Dependencies: 233
-- Name: organisation_links_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: jamesmcnamee
--

ALTER SEQUENCE public.organisation_links_id_seq OWNED BY public.organisation_links.id;


--
-- TOC entry 220 (class 1259 OID 16440)
-- Name: organisations; Type: TABLE; Schema: public; Owner: jamesmcnamee
--

CREATE TABLE public.organisations (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    type public.organisation_type NOT NULL,
    address text,
    phone character varying(30),
    email character varying(100),
    active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.organisations OWNER TO jamesmcnamee;

--
-- TOC entry 219 (class 1259 OID 16439)
-- Name: organisations_id_seq; Type: SEQUENCE; Schema: public; Owner: jamesmcnamee
--

CREATE SEQUENCE public.organisations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.organisations_id_seq OWNER TO jamesmcnamee;

--
-- TOC entry 3965 (class 0 OID 0)
-- Dependencies: 219
-- Name: organisations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: jamesmcnamee
--

ALTER SEQUENCE public.organisations_id_seq OWNED BY public.organisations.id;


--
-- TOC entry 224 (class 1259 OID 16479)
-- Name: patients; Type: TABLE; Schema: public; Owner: jamesmcnamee
--

CREATE TABLE public.patients (
    id integer NOT NULL,
    initials character varying(10),
    dob date,
    hcn character varying(10)
);


ALTER TABLE public.patients OWNER TO jamesmcnamee;

--
-- TOC entry 223 (class 1259 OID 16478)
-- Name: patients_id_seq; Type: SEQUENCE; Schema: public; Owner: jamesmcnamee
--

CREATE SEQUENCE public.patients_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.patients_id_seq OWNER TO jamesmcnamee;

--
-- TOC entry 3966 (class 0 OID 0)
-- Dependencies: 223
-- Name: patients_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: jamesmcnamee
--

ALTER SEQUENCE public.patients_id_seq OWNED BY public.patients.id;


--
-- TOC entry 226 (class 1259 OID 16492)
-- Name: queries; Type: TABLE; Schema: public; Owner: jamesmcnamee
--

CREATE TABLE public.queries (
    id integer NOT NULL,
    ref_number character varying(50) NOT NULL,
    patient_id integer,
    sender_org_id integer NOT NULL,
    recipient_org_id integer NOT NULL,
    created_by integer NOT NULL,
    assigned_to integer,
    category public.query_category NOT NULL,
    priority public.query_priority DEFAULT 'medium'::public.query_priority,
    status public.query_status DEFAULT 'new'::public.query_status,
    subject character varying(255) NOT NULL,
    resolution_note text,
    resolved_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.queries OWNER TO jamesmcnamee;

--
-- TOC entry 225 (class 1259 OID 16491)
-- Name: queries_id_seq; Type: SEQUENCE; Schema: public; Owner: jamesmcnamee
--

CREATE SEQUENCE public.queries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.queries_id_seq OWNER TO jamesmcnamee;

--
-- TOC entry 3967 (class 0 OID 0)
-- Dependencies: 225
-- Name: queries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: jamesmcnamee
--

ALTER SEQUENCE public.queries_id_seq OWNED BY public.queries.id;


--
-- TOC entry 228 (class 1259 OID 16539)
-- Name: query_replies; Type: TABLE; Schema: public; Owner: jamesmcnamee
--

CREATE TABLE public.query_replies (
    id integer NOT NULL,
    query_id integer NOT NULL,
    sender_id integer NOT NULL,
    body text NOT NULL,
    is_internal boolean DEFAULT false,
    read_at timestamp without time zone,
    sent_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.query_replies OWNER TO jamesmcnamee;

--
-- TOC entry 227 (class 1259 OID 16538)
-- Name: query_replies_id_seq; Type: SEQUENCE; Schema: public; Owner: jamesmcnamee
--

CREATE SEQUENCE public.query_replies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.query_replies_id_seq OWNER TO jamesmcnamee;

--
-- TOC entry 3968 (class 0 OID 0)
-- Dependencies: 227
-- Name: query_replies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: jamesmcnamee
--

ALTER SEQUENCE public.query_replies_id_seq OWNED BY public.query_replies.id;


--
-- TOC entry 222 (class 1259 OID 16456)
-- Name: users; Type: TABLE; Schema: public; Owner: jamesmcnamee
--

CREATE TABLE public.users (
    id integer NOT NULL,
    organisation_id integer NOT NULL,
    first_name character varying(50) NOT NULL,
    last_name character varying(50) NOT NULL,
    email character varying(100) NOT NULL,
    hashed_password character varying(255) NOT NULL,
    role public.user_role NOT NULL,
    active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    last_login timestamp without time zone
);


ALTER TABLE public.users OWNER TO jamesmcnamee;

--
-- TOC entry 221 (class 1259 OID 16455)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: jamesmcnamee
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO jamesmcnamee;

--
-- TOC entry 3969 (class 0 OID 0)
-- Dependencies: 221
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: jamesmcnamee
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 3763 (class 2604 OID 16567)
-- Name: audit_log id; Type: DEFAULT; Schema: public; Owner: jamesmcnamee
--

ALTER TABLE ONLY public.audit_log ALTER COLUMN id SET DEFAULT nextval('public.audit_log_id_seq'::regclass);


--
-- TOC entry 3765 (class 2604 OID 16589)
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: jamesmcnamee
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- TOC entry 3768 (class 2604 OID 16614)
-- Name: organisation_links id; Type: DEFAULT; Schema: public; Owner: jamesmcnamee
--

ALTER TABLE ONLY public.organisation_links ALTER COLUMN id SET DEFAULT nextval('public.organisation_links_id_seq'::regclass);


--
-- TOC entry 3748 (class 2604 OID 16443)
-- Name: organisations id; Type: DEFAULT; Schema: public; Owner: jamesmcnamee
--

ALTER TABLE ONLY public.organisations ALTER COLUMN id SET DEFAULT nextval('public.organisations_id_seq'::regclass);


--
-- TOC entry 3754 (class 2604 OID 16482)
-- Name: patients id; Type: DEFAULT; Schema: public; Owner: jamesmcnamee
--

ALTER TABLE ONLY public.patients ALTER COLUMN id SET DEFAULT nextval('public.patients_id_seq'::regclass);


--
-- TOC entry 3755 (class 2604 OID 16495)
-- Name: queries id; Type: DEFAULT; Schema: public; Owner: jamesmcnamee
--

ALTER TABLE ONLY public.queries ALTER COLUMN id SET DEFAULT nextval('public.queries_id_seq'::regclass);


--
-- TOC entry 3760 (class 2604 OID 16542)
-- Name: query_replies id; Type: DEFAULT; Schema: public; Owner: jamesmcnamee
--

ALTER TABLE ONLY public.query_replies ALTER COLUMN id SET DEFAULT nextval('public.query_replies_id_seq'::regclass);


--
-- TOC entry 3751 (class 2604 OID 16459)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: jamesmcnamee
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 3789 (class 2606 OID 16574)
-- Name: audit_log audit_log_pkey; Type: CONSTRAINT; Schema: public; Owner: jamesmcnamee
--

ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT audit_log_pkey PRIMARY KEY (id);


--
-- TOC entry 3791 (class 2606 OID 16599)
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: jamesmcnamee
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- TOC entry 3793 (class 2606 OID 16622)
-- Name: organisation_links organisation_links_pharmacy_id_gp_surgery_id_key; Type: CONSTRAINT; Schema: public; Owner: jamesmcnamee
--

ALTER TABLE ONLY public.organisation_links
    ADD CONSTRAINT organisation_links_pharmacy_id_gp_surgery_id_key UNIQUE (pharmacy_id, gp_surgery_id);


--
-- TOC entry 3795 (class 2606 OID 16620)
-- Name: organisation_links organisation_links_pkey; Type: CONSTRAINT; Schema: public; Owner: jamesmcnamee
--

ALTER TABLE ONLY public.organisation_links
    ADD CONSTRAINT organisation_links_pkey PRIMARY KEY (id);


--
-- TOC entry 3771 (class 2606 OID 16454)
-- Name: organisations organisations_email_key; Type: CONSTRAINT; Schema: public; Owner: jamesmcnamee
--

ALTER TABLE ONLY public.organisations
    ADD CONSTRAINT organisations_email_key UNIQUE (email);


--
-- TOC entry 3773 (class 2606 OID 16452)
-- Name: organisations organisations_pkey; Type: CONSTRAINT; Schema: public; Owner: jamesmcnamee
--

ALTER TABLE ONLY public.organisations
    ADD CONSTRAINT organisations_pkey PRIMARY KEY (id);


--
-- TOC entry 3779 (class 2606 OID 16490)
-- Name: patients patients_hcn_key; Type: CONSTRAINT; Schema: public; Owner: jamesmcnamee
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_hcn_key UNIQUE (hcn);


--
-- TOC entry 3781 (class 2606 OID 16488)
-- Name: patients patients_pkey; Type: CONSTRAINT; Schema: public; Owner: jamesmcnamee
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_pkey PRIMARY KEY (id);


--
-- TOC entry 3783 (class 2606 OID 16510)
-- Name: queries queries_pkey; Type: CONSTRAINT; Schema: public; Owner: jamesmcnamee
--

ALTER TABLE ONLY public.queries
    ADD CONSTRAINT queries_pkey PRIMARY KEY (id);


--
-- TOC entry 3785 (class 2606 OID 16512)
-- Name: queries queries_ref_number_key; Type: CONSTRAINT; Schema: public; Owner: jamesmcnamee
--

ALTER TABLE ONLY public.queries
    ADD CONSTRAINT queries_ref_number_key UNIQUE (ref_number);


--
-- TOC entry 3787 (class 2606 OID 16552)
-- Name: query_replies query_replies_pkey; Type: CONSTRAINT; Schema: public; Owner: jamesmcnamee
--

ALTER TABLE ONLY public.query_replies
    ADD CONSTRAINT query_replies_pkey PRIMARY KEY (id);


--
-- TOC entry 3775 (class 2606 OID 16472)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: jamesmcnamee
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 3777 (class 2606 OID 16470)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: jamesmcnamee
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 3804 (class 2606 OID 16580)
-- Name: audit_log audit_log_query_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: jamesmcnamee
--

ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT audit_log_query_id_fkey FOREIGN KEY (query_id) REFERENCES public.queries(id);


--
-- TOC entry 3805 (class 2606 OID 16575)
-- Name: audit_log audit_log_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: jamesmcnamee
--

ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT audit_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 3806 (class 2606 OID 16605)
-- Name: notifications notifications_query_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: jamesmcnamee
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_query_id_fkey FOREIGN KEY (query_id) REFERENCES public.queries(id);


--
-- TOC entry 3807 (class 2606 OID 16600)
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: jamesmcnamee
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 3808 (class 2606 OID 16628)
-- Name: organisation_links organisation_links_gp_surgery_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: jamesmcnamee
--

ALTER TABLE ONLY public.organisation_links
    ADD CONSTRAINT organisation_links_gp_surgery_id_fkey FOREIGN KEY (gp_surgery_id) REFERENCES public.organisations(id);


--
-- TOC entry 3809 (class 2606 OID 16623)
-- Name: organisation_links organisation_links_pharmacy_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: jamesmcnamee
--

ALTER TABLE ONLY public.organisation_links
    ADD CONSTRAINT organisation_links_pharmacy_id_fkey FOREIGN KEY (pharmacy_id) REFERENCES public.organisations(id);


--
-- TOC entry 3797 (class 2606 OID 16533)
-- Name: queries queries_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: jamesmcnamee
--

ALTER TABLE ONLY public.queries
    ADD CONSTRAINT queries_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id);


--
-- TOC entry 3798 (class 2606 OID 16528)
-- Name: queries queries_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: jamesmcnamee
--

ALTER TABLE ONLY public.queries
    ADD CONSTRAINT queries_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- TOC entry 3799 (class 2606 OID 16513)
-- Name: queries queries_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: jamesmcnamee
--

ALTER TABLE ONLY public.queries
    ADD CONSTRAINT queries_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id);


--
-- TOC entry 3800 (class 2606 OID 16523)
-- Name: queries queries_recipient_org_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: jamesmcnamee
--

ALTER TABLE ONLY public.queries
    ADD CONSTRAINT queries_recipient_org_id_fkey FOREIGN KEY (recipient_org_id) REFERENCES public.organisations(id);


--
-- TOC entry 3801 (class 2606 OID 16518)
-- Name: queries queries_sender_org_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: jamesmcnamee
--

ALTER TABLE ONLY public.queries
    ADD CONSTRAINT queries_sender_org_id_fkey FOREIGN KEY (sender_org_id) REFERENCES public.organisations(id);


--
-- TOC entry 3802 (class 2606 OID 16553)
-- Name: query_replies query_replies_query_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: jamesmcnamee
--

ALTER TABLE ONLY public.query_replies
    ADD CONSTRAINT query_replies_query_id_fkey FOREIGN KEY (query_id) REFERENCES public.queries(id) ON DELETE CASCADE;


--
-- TOC entry 3803 (class 2606 OID 16558)
-- Name: query_replies query_replies_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: jamesmcnamee
--

ALTER TABLE ONLY public.query_replies
    ADD CONSTRAINT query_replies_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id);


--
-- TOC entry 3796 (class 2606 OID 16473)
-- Name: users users_organisation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: jamesmcnamee
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_organisation_id_fkey FOREIGN KEY (organisation_id) REFERENCES public.organisations(id);


--
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: jamesmcnamee
--

CREATE TABLE public.refresh_tokens (
    id integer NOT NULL,
    user_id integer NOT NULL,
    token_hash character varying(255) NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    revoked boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.refresh_tokens OWNER TO jamesmcnamee;

--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: jamesmcnamee
--

CREATE SEQUENCE public.refresh_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.refresh_tokens_id_seq OWNER TO jamesmcnamee;

--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: jamesmcnamee
--

ALTER SEQUENCE public.refresh_tokens_id_seq OWNED BY public.refresh_tokens.id;

--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: public; Owner: jamesmcnamee
--

ALTER TABLE ONLY public.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('public.refresh_tokens_id_seq'::regclass);

--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: jamesmcnamee
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);

--
-- Name: refresh_tokens refresh_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: jamesmcnamee
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: jamesmcnamee
--

CREATE TABLE public.password_reset_tokens (
    id integer NOT NULL,
    user_id integer NOT NULL,
    token_hash character varying(255) NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    used boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.password_reset_tokens OWNER TO jamesmcnamee;

--
-- Name: password_reset_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: jamesmcnamee
--

CREATE SEQUENCE public.password_reset_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.password_reset_tokens_id_seq OWNER TO jamesmcnamee;

--
-- Name: password_reset_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: jamesmcnamee
--

ALTER SEQUENCE public.password_reset_tokens_id_seq OWNED BY public.password_reset_tokens.id;

--
-- Name: password_reset_tokens id; Type: DEFAULT; Schema: public; Owner: jamesmcnamee
--

ALTER TABLE ONLY public.password_reset_tokens ALTER COLUMN id SET DEFAULT nextval('public.password_reset_tokens_id_seq'::regclass);

--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: jamesmcnamee
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (id);

--
-- Name: password_reset_tokens password_reset_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: jamesmcnamee
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


-- Completed on 2026-07-02 17:43:40 BST

--
-- PostgreSQL database dump complete
--

