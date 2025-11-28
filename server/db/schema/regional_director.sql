CREATE TABLE IF NOT EXISTS regional_director (
    user_id BIGSERIAL,
    region_id SERIAL,
    FOREIGN KEY (user_id) REFERENCES user(id),
    FOREIGN KEY (region_id) REFERENCES region(id)
);