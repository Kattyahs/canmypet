ALTER TABLE search_history
DROP CONSTRAINT IF EXISTS fk_search_history_pet;

ALTER TABLE search_history
    ADD CONSTRAINT fk_search_history_pet
        FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE SET NULL;