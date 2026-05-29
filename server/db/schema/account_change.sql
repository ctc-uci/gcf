CREATE TABLE public.account_change (
    id bigint NOT NULL,
    user_id text,
    author_id text NOT NULL,
    change_type character varying(50) NOT NULL,
    old_values jsonb,
    new_values jsonb,
    resolved boolean NOT NULL DEFAULT false,
    last_modified timestamp with time zone NOT NULL,
    CONSTRAINT account_change_change_type_check CHECK ((change_type::text = ANY (ARRAY['Creation'::character varying, 'Update'::character varying, 'Deletion'::character varying]::text[]))),
    CONSTRAINT account_change_pkey PRIMARY KEY (id),
    CONSTRAINT fk_author_id FOREIGN KEY (author_id) REFERENCES public.gcf_user(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES public.gcf_user(id) ON DELETE SET NULL
);

CREATE SEQUENCE public.account_change_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.account_change_id_seq OWNED BY public.account_change.id;

ALTER TABLE ONLY public.account_change ALTER COLUMN id SET DEFAULT nextval('public.account_change_id_seq'::regclass);
