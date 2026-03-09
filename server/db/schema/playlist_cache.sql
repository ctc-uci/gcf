CREATE TABLE playlist_cache (
    playlist_id BIGINT,
    videos JSONB,
    cache_time TIMESTAMP,
    CONSTRAINT fk_playlist_id FOREIGN KEY (playlist_id) REFERENCES playlist(id),
    PRIMARY KEY(playlist_id)
);