package com.canmypet.petservice.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter

public class UserDto {
    private Long id;
    private String name;
    private String email;
    private String role;
    private Boolean verified;
}
