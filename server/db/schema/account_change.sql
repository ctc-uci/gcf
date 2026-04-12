
CREATE TABLE IF NOT EXISTS public.account_change (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    author_id TEXT,
    
    change_type VARCHAR(50) NOT NULL CHECK (change_type IN ('Creation', 'Update', 'Deletion')),
    old_values JSONB,
    new_values JSONB,
    resolved BOOLEAN NOT NULL DEFAULT FALSE,
    last_modified TIMESTAMP NOT NULL,

    CONSTRAINT fk_user_id
        FOREIGN KEY (user_id)
            REFERENCES public.gcf_user(id)
            ON DELETE CASCADE,

    CONSTRAINT fk_author_id
        FOREIGN KEY (author_id)
            REFERENCES public.gcf_user(id)
            ON DELETE SET NULL
    
);



