ALTER TABLE search_history
    ADD COLUMN species VARCHAR(255),
    ADD COLUMN life_stage VARCHAR(255);

UPDATE search_history sh
SET species = p.species,
    life_stage = p.life_stage
    FROM pets p
WHERE sh.pet_id = p.id;

ALTER TABLE search_history
    ADD CONSTRAINT ck_search_history_species
        CHECK (species IN ('DOG', 'CAT', 'RABBIT', 'BIRD', 'HAMSTER',
                           'GUINEA_PIG', 'FERRET', 'TURTLE', 'OTHER')),
    ADD CONSTRAINT ck_search_history_life_stage
        CHECK (life_stage IN ('PUPPY', 'ADULT', 'SENIOR')),
    ADD CONSTRAINT ck_search_history_life_stage_needs_species
        CHECK (life_stage IS NULL OR species IS NOT NULL);