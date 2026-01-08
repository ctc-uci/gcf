
CREATE TABLE instrument (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(70) NOT NULL
);

INSERT INTO instrument (name) VALUES
('Guitar'),
('Piano'),
('Violin'),
('Drums');