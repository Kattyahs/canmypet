package com.canmypet.petservice.storage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;
import java.util.regex.Pattern;

@Component
public class LocalPhotoStorage implements PhotoStorage {

    private static final Pattern KEY_FORMAT = Pattern.compile("^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$");

    private final Path directory;

    public LocalPhotoStorage(@Value("${app.storage.pet-photos-dir}") String directory) {
        this.directory = Path.of(directory).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.directory);
        } catch (IOException e) {
            throw new UncheckedIOException("Could not create the pet photos directory " + this.directory, e);
        }
    }

    @Override
    public String store(byte[] content) {
        String key = UUID.randomUUID().toString();
        try {
            Files.write(pathFor(key), content);
        } catch (IOException e) {
            throw new UncheckedIOException("Could not store the photo", e);
        }
        return key;
    }

    @Override
    public byte[] load(String key) {
        try {
            return Files.readAllBytes(pathFor(key));
        } catch (IOException e) {
            throw new UncheckedIOException("Could not read the photo", e);
        }
    }

    @Override
    public void delete(String key) {
        try {
            Files.deleteIfExists(pathFor(key));
        } catch (IOException e) {
            throw new UncheckedIOException("Could not delete the photo", e);
        }
    }

    private Path pathFor(String key) {
        if (key == null || !KEY_FORMAT.matcher(key).matches()) {
            throw new IllegalArgumentException("Invalid photo key");
        }
        return directory.resolve(key + ".jpg");
    }
}