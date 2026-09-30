package com.canmypet.petservice.storage;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class LocalPhotoStorageTest {

    @TempDir
    Path directory;

    @Test
    void store_thenLoad_returnsTheSameBytesUnderARandomKey() {
        LocalPhotoStorage storage = new LocalPhotoStorage(directory.toString());
        byte[] content = {1, 2, 3};

        String key = storage.store(content);

        assertThat(key).matches("[0-9a-f-]{36}");
        assertThat(storage.load(key)).containsExactly(1, 2, 3);
    }

    @Test
    void delete_removesTheFile() {
        LocalPhotoStorage storage = new LocalPhotoStorage(directory.toString());
        String key = storage.store(new byte[]{1});

        storage.delete(key);

        assertThat(Files.exists(directory.resolve(key + ".jpg"))).isFalse();
    }

    @Test
    void load_withPathTraversalKey_isRejected() {
        LocalPhotoStorage storage = new LocalPhotoStorage(directory.toString());

        assertThatThrownBy(() -> storage.load("../../etc/passwd")).isInstanceOf(IllegalArgumentException.class);
    }
}