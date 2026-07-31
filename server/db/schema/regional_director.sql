CREATE TABLE public.regional_director (
    user_id text NOT NULL,
    region_id integer NOT NULL,
    CONSTRAINT regional_director_pkey PRIMARY KEY (user_id, region_id),
    CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES public.gcf_user(id),
    CONSTRAINT fk_region_id FOREIGN KEY (region_id) REFERENCES public.region(id) ON DELETE CASCADE
);
