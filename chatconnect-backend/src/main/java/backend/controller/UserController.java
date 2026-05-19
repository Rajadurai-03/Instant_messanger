package backend.controller;

import backend.model.AdminConfig;
import backend.model.PasswordResetRequest;
import backend.model.User;
import backend.repository.AdminConfigRepository;
import backend.repository.PasswordResetRequestRepository;
import backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class UserController {

    private static final String ADMIN_NAME = "Admin";

    @Autowired private UserRepository userRepository;
    @Autowired private AdminConfigRepository adminConfigRepo;
    @Autowired private PasswordResetRequestRepository resetRepo;

    private AdminConfig getAdmin() {
        return adminConfigRepo.findById(1L).orElseGet(() -> new AdminConfig("9876543210", "Raja@2003"));
    }

    // ── SIGNUP ───────────────────────────────────────────────────────────────
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody Map<String, String> body) {
        String name = body.get("name"), phone = body.get("phone"), password = body.get("password");
        if (name == null || name.trim().isEmpty())
            return ResponseEntity.badRequest().body(Map.of("error", "Please enter your name"));
        if (phone == null || phone.length() != 10)
            return ResponseEntity.badRequest().body(Map.of("error", "Phone number must be exactly 10 digits"));
        if (password == null || password.length() < 8)
            return ResponseEntity.badRequest().body(Map.of("error", "Password must be at least 8 characters"));
        if (getAdmin().getPhone().equals(phone) || userRepository.existsByPhone(phone))
            return ResponseEntity.badRequest().body(Map.of("error", "An account with this number already exists."));
        User saved = userRepository.save(new User(name.trim(), phone, password));
        return ResponseEntity.ok(Map.of("name", saved.getName(), "phone", saved.getPhone(), "isAdmin", false));
    }

    // ── LOGIN ────────────────────────────────────────────────────────────────
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String phone = body.get("phone"), password = body.get("password");
        AdminConfig admin = getAdmin();
        if (admin.getPhone().equals(phone)) {
            if (admin.getPassword().equals(password))
                return ResponseEntity.ok(Map.of("name", ADMIN_NAME, "phone", phone, "isAdmin", true));
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid admin password"));
        }
        Optional<User> opt = userRepository.findByPhone(phone);
        if (opt.isEmpty())
            return ResponseEntity.badRequest().body(Map.of("error", "No existing user found. Please sign up."));
        if (!opt.get().getPassword().equals(password))
            return ResponseEntity.badRequest().body(Map.of("error", "Incorrect password."));
        return ResponseEntity.ok(Map.of("name", opt.get().getName(), "phone", phone, "isAdmin", false));
    }

    // ── FORGOT PASSWORD ──────────────────────────────────────────────────────
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> body) {
        String phone = body.get("phone");
        if (phone == null || phone.length() != 10)
            return ResponseEntity.badRequest().body(Map.of("error", "Enter a valid 10-digit phone number"));
        Optional<User> opt = userRepository.findByPhone(phone);
        if (opt.isEmpty())
            return ResponseEntity.badRequest().body(Map.of("error", "No account found with this number"));
        PasswordResetRequest req = resetRepo.findByPhone(phone)
                .orElse(new PasswordResetRequest(phone, opt.get().getName()));
        req.setApproved(false);
        resetRepo.save(req);
        return ResponseEntity.ok(Map.of("message", "Reset request sent to admin"));
    }

    // ── CHECK APPROVAL ───────────────────────────────────────────────────────
    @GetMapping("/check-approval/{phone}")
    public ResponseEntity<?> checkApproval(@PathVariable String phone) {
        return resetRepo.findByPhone(phone)
                .map(r -> ResponseEntity.ok(Map.of("approved", r.isApproved())))
                .orElse(ResponseEntity.ok(Map.of("approved", false)));
    }

    // ── RESET PASSWORD ───────────────────────────────────────────────────────
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
        String phone = body.get("phone"), newPassword = body.get("newPassword");
        if (newPassword == null || newPassword.length() < 8)
            return ResponseEntity.badRequest().body(Map.of("error", "Password must be at least 8 characters"));
        Optional<PasswordResetRequest> reqOpt = resetRepo.findByPhone(phone);
        if (reqOpt.isEmpty() || !reqOpt.get().isApproved())
            return ResponseEntity.badRequest().body(Map.of("error", "Reset not approved yet"));
        Optional<User> opt = userRepository.findByPhone(phone);
        if (opt.isEmpty()) return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
        User user = opt.get();
        user.setPassword(newPassword);
        userRepository.save(user);
        resetRepo.delete(reqOpt.get());
        return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
    }

    // ── UPDATE user photo ─────────────────────────────────────────────────────
    @PostMapping("/photo")
    public ResponseEntity<?> updatePhoto(@RequestBody Map<String, String> body) {
        String name = body.get("name"), photo = body.get("photo");
        return userRepository.findAll().stream()
            .filter(u -> u.getName().equals(name))
            .findFirst()
            .map(u -> {
                u.setPhoto(photo);
                userRepository.save(u);
                return ResponseEntity.ok(Map.of("message", "Photo updated"));
            })
            .orElse(ResponseEntity.badRequest().body(Map.of("error", "User not found")));
    }
}
