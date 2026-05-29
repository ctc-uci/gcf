CREATE SEQUENCE public.playlist_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE TABLE public.playlist (
    id bigint NOT NULL DEFAULT nextval('public.playlist_id_seq'::regclass),
    program_id bigint NOT NULL,
    instrument_id bigint NOT NULL,
    link text NOT NULL,
    name character varying(128) NOT NULL,
    CONSTRAINT playlist_pkey PRIMARY KEY (id),
    CONSTRAINT playlist_unique UNIQUE (program_id, instrument_id, link),
    CONSTRAINT fk_program_id FOREIGN KEY (program_id) REFERENCES public.program(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_instrument_id FOREIGN KEY (instrument_id) REFERENCES public.instrument(id)
);
