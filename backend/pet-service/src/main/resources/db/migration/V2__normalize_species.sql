-- Normaliza los valores de species heredados del modelo de texto libre.
-- Antes de la migracion al enum Species, la columna aceptaba cualquier cadena
-- (por ejemplo 'dog'), lo que rompia la lectura de la entidad Pet en Hibernate.

UPDATE pets
SET species = UPPER(TRIM(species))
WHERE species IS NOT NULL;

-- Cualquier valor que no corresponda a una constante del enum pasa a OTHER
-- para garantizar que la tabla quede consistente con el modelo de dominio.
UPDATE pets
SET species = 'OTHER'
WHERE species IS NOT NULL
  AND species NOT IN ('DOG', 'CAT', 'RABBIT', 'BIRD', 'HAMSTER',
                      'GUINEA_PIG', 'FERRET', 'TURTLE', 'OTHER');

-- Restriccion a nivel de base de datos para impedir que vuelvan a entrar
-- valores fuera del enum, sin importar por que via se inserten.
ALTER TABLE pets
    ADD CONSTRAINT ck_pets_species
        CHECK (species IN ('DOG', 'CAT', 'RABBIT', 'BIRD', 'HAMSTER',
                           'GUINEA_PIG', 'FERRET', 'TURTLE', 'OTHER'));