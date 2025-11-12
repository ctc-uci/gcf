-- TODO: delete sample file

DROP TABLE IF EXISTS sample CASCADE;

CREATE TABLE sample (
  id SERIAL PRIMARY KEY,
  content VARCHAR(256) NOT NULL
);

