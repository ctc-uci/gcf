CREATE TABLE public.instrument_change (
    id bigint NOT NULL,
    instrument_id bigint NOT NULL,
    update_id bigint NOT NULL,
    amount_changed smallint NOT NULL,
    special_request boolean NOT NULL DEFAULT false,
    event_type character varying(50) NOT NULL,
    description text,
    CONSTRAINT instrument_change_event_type_check CHECK ((event_type::text = ANY (ARRAY['broken'::character varying, 'missing'::character varying, 'new_donation'::character varying, 'needs_repair'::character varying, 'other'::character varying]::text[]))),
    CONSTRAINT instrument_change_pkey PRIMARY KEY (id),
    CONSTRAINT fk_instrument FOREIGN KEY (instrument_id) REFERENCES public.instrument(id) ON DELETE CASCADE,
    CONSTRAINT fk_update FOREIGN KEY (update_id) REFERENCES public.program_update(id) ON DELETE CASCADE
);

CREATE SEQUENCE public.instrument_change_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.instrument_change_id_seq OWNED BY public.instrument_change.id;

ALTER TABLE ONLY public.instrument_change ALTER COLUMN id SET DEFAULT nextval('public.instrument_change_id_seq'::regclass);
