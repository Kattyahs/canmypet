package com.canmypet.foodservice.exception;

import com.canmypet.foodservice.controller.PublicFoodController;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.net.URI;
import java.util.Arrays;

@Slf4j
@RestControllerAdvice(assignableTypes = PublicFoodController.class)
@Order(Ordered.HIGHEST_PRECEDENCE)
public class PublicApiExceptionHandler {

    private static final String PROBLEM_BASE_URI = "https://canmypet.dev/problems/";

    @ExceptionHandler(InvalidPublicParameterException.class)
    public ProblemDetail handleInvalidParameter(InvalidPublicParameterException ex) {
        return invalidParameter(ex.getMessage());
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ProblemDetail handleMissingParameter(MissingServletRequestParameterException ex) {
        return invalidParameter("Missing required parameter '" + ex.getParameterName() + "'");
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ProblemDetail handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        Class<?> requiredType = ex.getRequiredType();
        String allowedValues = requiredType != null && requiredType.isEnum()
                ? ". Allowed values: " + Arrays.toString(requiredType.getEnumConstants())
                : "";
        return invalidParameter("Invalid value '" + ex.getValue() + "' for parameter '" + ex.getName() + "'" + allowedValues);
    }

    @ExceptionHandler(Exception.class)
    public ProblemDetail handleUnexpected(Exception ex) {
        log.error("Unexpected error in public API", ex);
        return problem(HttpStatus.INTERNAL_SERVER_ERROR, "internal-error", "Internal error",
                "An unexpected error occurred", "INTERNAL_ERROR");
    }

    private ProblemDetail invalidParameter(String detail) {
        return problem(HttpStatus.BAD_REQUEST, "invalid-parameter", "Invalid parameter", detail, "INVALID_PARAMETER");
    }

    private ProblemDetail problem(HttpStatus status, String slug, String title, String detail, String code) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(status, detail);
        problem.setType(URI.create(PROBLEM_BASE_URI + slug));
        problem.setTitle(title);
        problem.setProperty("code", code);
        return problem;
    }
}