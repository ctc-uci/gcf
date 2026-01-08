


CREATE TABLE instrument_change (
  id BIGSERIAL PRIMARY KEY,

  instrument_id BIGINT NOT NULL,
  update_id BIGINT NOT NULL,
  amount_changed SMALLINT NOT NULL,
  
    CONSTRAINT fk_instrument
      FOREIGN KEY (instrument_id) 
        REFERENCES instrument(id)
          ON DELETE CASCADE,
    CONSTRAINT fk_update
      FOREIGN KEY (update_id)
        REFERENCES update(id)
          ON DELETE CASCADE
  );