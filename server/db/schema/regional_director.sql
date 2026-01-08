CREATE TABLE IF NOT EXISTS regional_director (
    user_id BIGINT,
    region_id INT,
    CONSTRAINT fk_user_id        
        FOREIGN KEY (user_id) REFERENCES user(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_region_id
        FOREIGN KEY (region_id) REFERENCES region(id)
        ON DELETE CASCADE,
    PRIMARY KEY (user_id, region_id)
);