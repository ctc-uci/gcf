CREATE TABLE country (
    id SERIAL PRIMARY KEY,
 	region_id INT NOT NULL,
    name VARCHAR(70) NOT NULL,
    last_modified TIMESTAMP NOT NULL

	CONSTRAINT fk_region_id
    	FOREIGN KEY (region_id)
  		REFERENCES region(id)
  		ON DELETE CASCADE
		ON UPDATE CASCADE,
);
