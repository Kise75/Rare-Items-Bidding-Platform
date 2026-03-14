package com.maitanphat.rareitems.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomePageController {

    @GetMapping({"/", "/welcome"})
    public String index() {
        return "forward:/index.html";
    }
}
