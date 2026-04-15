CREATE TABLE playlist (
  id BIGSERIAL PRIMARY KEY,
  program_id BIGINT NOT NULL,
  instrument_id BIGINT NOT NULL,
  link TEXT NOT NULL,
  name VARCHAR(256) NOT NULL,
  CONSTRAINT fk_program_id FOREIGN KEY (program_id) REFERENCES program(id),
  CONSTRAINT fk_instrument_id FOREIGN KEY (instrument_id) REFERENCES instrument(id),
  UNIQUE (program_id, instrument_id, link)
);