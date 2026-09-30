package com.canmypet.petservice.service;

import com.canmypet.petservice.exception.InvalidImageException;
import org.springframework.stereotype.Component;

import javax.imageio.IIOImage;
import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import javax.imageio.stream.ImageInputStream;
import javax.imageio.stream.ImageOutputStream;
import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Iterator;

@Component
public class ImageSanitizer {

    static final int MAX_SIDE = 1024;
    private static final int MAX_SOURCE_SIDE = 8000;
    private static final float JPEG_QUALITY = 0.85f;

    public byte[] sanitize(byte[] content) {
        if (!isJpeg(content) && !isPng(content)) {
            throw new InvalidImageException("Only JPEG and PNG images are accepted");
        }
        BufferedImage source = decode(content);
        BufferedImage resized = resize(source);
        return encodeJpeg(resized);
    }

    static boolean isJpeg(byte[] content) {
        return content != null && content.length > 3
                && (content[0] & 0xFF) == 0xFF && (content[1] & 0xFF) == 0xD8 && (content[2] & 0xFF) == 0xFF;
    }

    static boolean isPng(byte[] content) {
        byte[] signature = {(byte) 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A};
        if (content == null || content.length < signature.length) {
            return false;
        }
        for (int i = 0; i < signature.length; i++) {
            if (content[i] != signature[i]) {
                return false;
            }
        }
        return true;
    }

    private BufferedImage decode(byte[] content) {
        try (ImageInputStream input = ImageIO.createImageInputStream(new ByteArrayInputStream(content))) {
            Iterator<ImageReader> readers = ImageIO.getImageReaders(input);
            if (!readers.hasNext()) {
                throw new InvalidImageException("The file is not a valid image");
            }
            ImageReader reader = readers.next();
            try {
                reader.setInput(input, true, true);
                if (reader.getWidth(0) > MAX_SOURCE_SIDE || reader.getHeight(0) > MAX_SOURCE_SIDE) {
                    throw new InvalidImageException("The image is too large");
                }
                BufferedImage image = reader.read(0);
                if (image == null) {
                    throw new InvalidImageException("The file is not a valid image");
                }
                return image;
            } finally {
                reader.dispose();
            }
        } catch (IOException e) {
            throw new InvalidImageException("The file is not a valid image");
        }
    }

    private BufferedImage resize(BufferedImage source) {
        double scale = Math.min(1.0, (double) MAX_SIDE / Math.max(source.getWidth(), source.getHeight()));
        int width = Math.max(1, (int) Math.round(source.getWidth() * scale));
        int height = Math.max(1, (int) Math.round(source.getHeight() * scale));

        BufferedImage target = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        Graphics2D graphics = target.createGraphics();
        try {
            graphics.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
            graphics.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
            graphics.setColor(Color.WHITE);
            graphics.fillRect(0, 0, width, height);
            graphics.drawImage(source, 0, 0, width, height, null);
        } finally {
            graphics.dispose();
        }
        return target;
    }

    private byte[] encodeJpeg(BufferedImage image) {
        ImageWriter writer = ImageIO.getImageWritersByFormatName("jpeg").next();
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        try (ImageOutputStream stream = ImageIO.createImageOutputStream(output)) {
            writer.setOutput(stream);
            ImageWriteParam params = writer.getDefaultWriteParam();
            params.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
            params.setCompressionQuality(JPEG_QUALITY);
            writer.write(null, new IIOImage(image, null, null), params);
        } catch (IOException e) {
            throw new IllegalStateException("Could not encode the image", e);
        } finally {
            writer.dispose();
        }
        return output.toByteArray();
    }
}