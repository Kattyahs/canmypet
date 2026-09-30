package com.canmypet.petservice.storage;

public interface PhotoStorage {

    String store(byte[] content);

    byte[] load(String key);

    void delete(String key);
}