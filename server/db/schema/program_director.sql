CREATE TABLE public.program_director (
    user_id text NOT NULL,
    program_id bigint NOT NULL,
    bio text,
    CONSTRAINT program_director_pkey PRIMARY KEY (user_id, program_id),
    CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES public.gcf_user(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_program_id FOREIGN KEY (program_id) REFERENCES public.program(id) ON DELETE CASCADE ON UPDATE CASCADE
);
