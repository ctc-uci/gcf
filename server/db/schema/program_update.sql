CREATE TABLE program_update (
  id             BIGSERIAL PRIMARY KEY,
  title          VARCHAR(256)                   NOT NULL,
  program_id     BIGINT REFERENCES program (id) NOT NULL,
  created_by     BIGINT REFERENCES "user" (id),
  update_date    DATE                           NOT NULL,
  note           TEXT,
  show_on_table  BOOLEAN NOT NULL DEFAULT TRUE
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved boolean NOT NULL DEFAULT false
);