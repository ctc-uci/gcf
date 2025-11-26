
CREATE TABLE instrument_change (
  id BIGSERIAL PRIMARY KEY,

  instrument_id BIGSERIAL NOT NULL,
  update_id BIGSERIAL NOT NULL,
  amount_changed SMALLINT NOT NULL,
  
    CONSTRAINT fk_instrument
      FOREIGN KEY (instrument_id) 
        REFERENCES instrument(id),
    CONSTRAINT fk_update
      FOREIGN KEY (update_id)
        REFERENCES update(id)
  );