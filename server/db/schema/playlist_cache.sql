CREATE TABLE playlist_cache (
    playlist_id VARCHAR,
    videos JSONB,
    cache_time TIMESTAMPTZ,
    PRIMARY KEY(playlist_id)
);