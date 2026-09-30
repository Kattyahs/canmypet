package com.canmypet.petservice.service;

import com.canmypet.petservice.exception.InvalidImageException;
import org.junit.jupiter.api.Test;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ImageSanitizerTest {

    private final ImageSanitizer sanitizer = new ImageSanitizer();

    @Test
    void sanitize_largePng_returnsJpegResizedToMaxSide() throws IOException {
        byte[] png = encode(new BufferedImage(3000, 1500, BufferedImage.TYPE_INT_ARGB), "png");

        byte[] result = sanitizer.sanitize(png);

        BufferedImage decoded = ImageIO.read(new ByteArrayInputStream(result));
        assertThat(ImageSanitizer.isJpeg(result)).isTrue();
        assertThat(decoded.getWidth()).isEqualTo(ImageSanitizer.MAX_SIDE);
        assertThat(decoded.getHeight()).isEqualTo(ImageSanitizer.MAX_SIDE / 2);
    }

    @Test
    void sanitize_smallJpeg_keepsItsSize() throws IOException {
        byte[] jpeg = encode(new BufferedImage(200, 100, BufferedImage.TYPE_INT_RGB), "jpg");

        BufferedImage decoded = ImageIO.read(new ByteArrayInputStream(sanitizer.sanitize(jpeg)));

        assertThat(decoded.getWidth()).isEqualTo(200);
        assertThat(decoded.getHeight()).isEqualTo(100);
    }

    @Test
    void sanitize_jpegWithExifMetadata_removesTheMetadata() throws IOException {
        byte[] jpeg = encode(new BufferedImage(200, 100, BufferedImage.TYPE_INT_RGB), "jpg");
        byte[] exifSegment = {(byte) 0xFF, (byte) 0xE1, 0x00, 0x10, 'E', 'x', 'i', 'f', 0, 0, 'G', 'P', 'S', '-', '3', '3', '.', '4'};
        byte[] withExif = new byte[jpeg.length + exifSegment.length];
        System.arraycopy(jpeg, 0, withExif, 0, 2);
        System.arraycopy(exifSegment, 0, withExif, 2, exifSegment.length);
        System.arraycopy(jpeg, 2, withExif, 2 + exifSegment.length, jpeg.length - 2);

        byte[] result = sanitizer.sanitize(withExif);

        assertThat(new String(withExif, StandardCharsets.ISO_8859_1)).contains("Exif");
        assertThat(new String(result, StandardCharsets.ISO_8859_1)).doesNotContain("Exif").doesNotContain("GPS");
    }

    @Test
    void sanitize_htmlRenamedAsImage_isRejected() {
        byte[] html = "<html><script>alert(1)</script></html>".getBytes(StandardCharsets.UTF_8);

        assertThatThrownBy(() -> sanitizer.sanitize(html)).isInstanceOf(InvalidImageException.class);
    }

    @Test
    void sanitize_pngSignatureWithBrokenContent_isRejected() {
        byte[] broken = {(byte) 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A, 1, 2, 3};

        assertThatThrownBy(() -> sanitizer.sanitize(broken)).isInstanceOf(InvalidImageException.class);
    }

    @Test
    void sanitize_gif_isRejected() throws IOException {
        byte[] gif = encode(new BufferedImage(10, 10, BufferedImage.TYPE_INT_RGB), "gif");

        assertThatThrownBy(() -> sanitizer.sanitize(gif)).isInstanceOf(InvalidImageException.class);
    }

    private static byte[] encode(BufferedImage image, String format) throws IOException {
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        ImageIO.write(image, format, output);
        return output.toByteArray();
    }
}