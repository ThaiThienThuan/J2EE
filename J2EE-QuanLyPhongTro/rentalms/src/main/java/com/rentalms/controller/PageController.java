package com.rentalms.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PageController {

    @GetMapping("/home")
    public String home() { return "forward:/home.html"; }

    @GetMapping("/login")
    public String login() { return "forward:/login.html"; }

    @GetMapping("/register")
    public String register() { return "forward:/register.html"; }

    @GetMapping("/dashboard")
    public String dashboard() { return "forward:/dashboard.html"; }

    @GetMapping("/rentalms")
    public String rental() { return "forward:/rentalms.html"; }

    @GetMapping("/notifications")
    public String notifications() { return "forward:/notifications.html"; }
}
