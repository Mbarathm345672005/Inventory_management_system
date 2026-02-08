package com.inventory.controllers;

import com.inventory.models.User;
import com.inventory.payload.JwtResponse;
import com.inventory.payload.LoginRequest;

import com.inventory.payload.ResetPasswordRequest; 
import com.inventory.payload.ForgotPasswordRequest;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.Optional;
import com.inventory.payload.MessageResponse;
import com.inventory.payload.SignUpRequest;
import com.inventory.repositories.UserRepository;
import com.inventory.security.JwtUtil;
import com.inventory.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder passwordEncoder;

    @Autowired
    JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtil.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String role = userDetails.getRole();
        // Custom logic: Check if admin is validated
       if ((role.equals("ROLE_ADMIN") || role.equals("ROLE_STORE_MANAGER")) && !userDetails.isValidated()) {
            return ResponseEntity.status(401).body(new MessageResponse("Error: Account is pending approval!"));
        }

        return ResponseEntity.ok(new JwtResponse(
                jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                role,
                userDetails.isValidated()
        ));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@RequestBody SignUpRequest signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Email is already in use!"));
        }

        User user = new User();
        user.setName(signUpRequest.getName());
        user.setEmail(signUpRequest.getEmail());
        user.setPassword(passwordEncoder.encode(signUpRequest.getPassword()));
        user.setDept(signUpRequest.getDept());
        user.setPhoneNo(signUpRequest.getPhoneNo());
        user.setWarehouseLocation(signUpRequest.getWarehouseLocation());
        
        String role = signUpRequest.getRole();
        user.setRole(role);

       if (role.equals("ROLE_ADMIN") || role.equals("ROLE_STORE_MANAGER")) {
            user.setValidated(false); // Needs approval
        } else {
            user.setValidated(true); // User is auto-approved
        }

        userRepository.save(user);
        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest forgotPasswordRequest) {
        String email = forgotPasswordRequest.getEmail();
        Optional<User> optionalUser = userRepository.findByEmail(email);

        // Security best practice: Always return a success message
        // to prevent "user enumeration" (attackers guessing valid emails).
        if (!optionalUser.isPresent()) {
            return ResponseEntity.ok(new MessageResponse("If your email exists, a reset link has been sent."));
        }

        User user = optionalUser.get();
        
        // Generate a unique token
        String token = UUID.randomUUID().toString();
        user.setResetToken(token);
        user.setResetTokenExpiry(LocalDateTime.now().plusHours(1)); // 1-hour expiry
        
        userRepository.save(user);

        // --- THIS IS THE "MOCK" EMAIL ---
        // In a real app, you would inject JavaMailSender and send an email here.
        System.out.println("====================================================");
        System.out.println("PASSWORD RESET LINK (MOCK EMAIL):");
        System.out.println("Email: " + user.getEmail());
        System.out.println("Token: " + token);
        System.out.println("Link: http://localhost:3000/reset-password/" + token);
        System.out.println("====================================================");
        // ---------------------------------

        return ResponseEntity.ok(new MessageResponse("If your email exists, a reset link has been sent."));
    }

    // --- 6. ADD NEW ENDPOINT: RESET PASSWORD ---
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest resetPasswordRequest) {
        
        String token = resetPasswordRequest.getToken();
        String newPassword = resetPasswordRequest.getNewPassword();

        Optional<User> optionalUser = userRepository.findByResetToken(token);

        if (!optionalUser.isPresent()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Invalid or expired reset token."));
        }

        User user = optionalUser.get();

        // Check if token is expired
        if (user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            // Clear the expired token
            user.setResetToken(null);
            user.setResetTokenExpiry(null);
            userRepository.save(user);
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Invalid or expired reset token."));
        }

        // Token is valid. Update the password.
        user.setPassword(passwordEncoder.encode(newPassword));
        
        // Invalidate the token so it can't be used again
        user.setResetToken(null);
        user.setResetTokenExpiry(null);

        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("Password has been reset successfully."));
    }
}