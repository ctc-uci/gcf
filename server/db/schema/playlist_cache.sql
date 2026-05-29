CREATE TABLE public.playlist_cache (
    playlist_id character varying NOT NULL,
    videos jsonb,
    cache_time timestamp with time zone,
    CONSTRAINT playlist_cache_pkey PRIMARY KEY (playlist_id)
);
