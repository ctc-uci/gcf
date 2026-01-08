CREATE TABLE program_update (
  id          BIGSERIAL PRIMARY KEY,
  title       VARCHAR(256)                   NOT NULL,
  program_id  BIGINT REFERENCES program (id) NOT NULL,
  created_by  BIGINT REFERENCES "user" (id)  NOT NULL,
  update_date DATE                           NOT NULL,
  note        TEXT                           NOT NULL
);

INSERT INTO program_update (title, program_id, created_by, update_date, note)
VALUES
('Spring Inventory Update', 1, 1, '2026-01-01', 'Updated instrument counts for spring semester'),
('Budget Adjustment', 1, 2, '2026-01-05', 'Adjusted quantities due to budget changes'),
('New Equipment Arrival', 2, 1, '2026-01-07', 'Added newly purchased instruments');