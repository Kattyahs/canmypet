-- Normaliza los valores de species heredados del modelo de texto libre.

UPDATE food_safety
SET species = UPPER(TRIM(species))
WHERE species IS NOT NULL;

UPDATE food_safety
SET species = 'OTHER'
WHERE species IS NOT NULL
  AND species NOT IN ('DOG', 'CAT', 'RABBIT', 'BIRD', 'HAMSTER',
                      'GUINEA_PIG', 'FERRET', 'TURTLE', 'OTHER');

ALTER TABLE food_safety
    ADD CONSTRAINT ck_food_safety_species
        CHECK (species IN ('DOG', 'CAT', 'RABBIT', 'BIRD', 'HAMSTER',
                           'GUINEA_PIG', 'FERRET', 'TURTLE', 'OTHER'));