CREATE TABLE playlist_cache (
    playlist_id VARCHAR,
    videos JSONB,
    cache_time TIMESTAMP,
    PRIMARY KEY(playlist_id)
);