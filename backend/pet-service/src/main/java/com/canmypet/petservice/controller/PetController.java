package com.canmypet.petservice.controller;

import com.canmypet.petservice.dto.PetRequest;
import com.canmypet.petservice.dto.PetResponse;
import com.canmypet.petservice.exception.InvalidImageException;
import com.canmypet.petservice.security.JwtPrincipal;
import com.canmypet.petservice.service.PetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/pets")
@RequiredArgsConstructor
public class PetController {

    private final PetService petService;

    @GetMapping
    public ResponseEntity<List<PetResponse>> getMyPets(@AuthenticationPrincipal JwtPrincipal principal) {
        return ResponseEntity.ok(petService.getPetsByOwner(principal.userId()));
    }

    @PostMapping
    public ResponseEntity<PetResponse> createPet(
            @Valid @RequestBody PetRequest request,
            @AuthenticationPrincipal JwtPrincipal principal
    ) {
        PetResponse response = petService.createPet(request, principal.userId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PetResponse> updatePet(
            @PathVariable Long id,
            @Valid @RequestBody PetRequest request,
            @AuthenticationPrincipal JwtPrincipal principal
    ) {
        return ResponseEntity.ok(petService.updatePet(id, request, principal.userId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePet(
            @PathVariable Long id,
            @AuthenticationPrincipal JwtPrincipal principal
    ) {
        petService.deletePet(id, principal.userId());
        return ResponseEntity.noContent().build();
    }

    @PutMapping(value = "/{id}/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PetResponse> uploadPhoto(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal JwtPrincipal principal
    ) throws IOException {
        if (file.isEmpty()) {
            throw new InvalidImageException("The photo file is empty");
        }
        return ResponseEntity.ok(petService.updatePhoto(id, file.getBytes(), principal.userId()));
    }

    @GetMapping("/{id}/photo")
    public ResponseEntity<byte[]> getPhoto(
            @PathVariable Long id,
            @AuthenticationPrincipal JwtPrincipal principal
    ) {
        byte[] photo = petService.getPhoto(id, principal.userId());
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG)
                .cacheControl(CacheControl.maxAge(1, TimeUnit.HOURS).cachePrivate())
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.inline().build().toString())
                .body(photo);
    }

    @DeleteMapping("/{id}/photo")
    public ResponseEntity<PetResponse> deletePhoto(
            @PathVariable Long id,
            @AuthenticationPrincipal JwtPrincipal principal
    ) {
        return ResponseEntity.ok(petService.deletePhoto(id, principal.userId()));
    }
}