CREATE TABLE public.program_update (
    id bigint NOT NULL,
    title character varying(256) NOT NULL,
    program_id bigint NOT NULL,
    created_by text,
    update_date date NOT NULL,
    note text,
    show_on_table boolean NOT NULL DEFAULT false,
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    resolved boolean NOT NULL DEFAULT false,
    CONSTRAINT program_update_pkey PRIMARY KEY (id),
    CONSTRAINT fk_program_id FOREIGN KEY (program_id) REFERENCES public.program(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_created_by FOREIGN KEY (created_by) REFERENCES public.gcf_user(id) ON DELETE SET NULL
);

CREATE SEQUENCE public.program_update_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.program_update_id_seq OWNED BY public.program_update.id;

ALTER TABLE ONLY public.program_update ALTER COLUMN id SET DEFAULT nextval('public.program_update_id_seq'::regclass);
