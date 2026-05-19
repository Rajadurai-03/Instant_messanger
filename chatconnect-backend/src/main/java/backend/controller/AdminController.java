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

import jakarta.annotation.PostConstruct;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    private static final String DEFAULT_PHONE = "9876543210";
    private static final String DEFAULT_PASS  = "Raja@2003";

    @Autowired private AdminConfigRepository adminConfigRepo;
    @Autowired private UserRepository userRepository;
    @Autowired private PasswordResetRequestRepository resetRepo;

    // Seed default admin credentials if DB row doesn't exist yet
    @PostConstruct
    public void seedAdmin() {
        if (adminConfigRepo.count() == 0) {
            adminConfigRepo.save(new AdminConfig(DEFAULT_PHONE, DEFAULT_PASS));
        }
    }

    private AdminConfig getAdmin() {
        return adminConfigRepo.findById(1L).orElseGet(() -> {
            AdminConfig a = new AdminConfig(DEFAULT_PHONE, DEFAULT_PASS);
            adminConfigRepo.save(a);
            return a;
        });
    }

    // ── GET all users ────────────────────────────────────────────────────────
    @GetMapping("/users")
    public List<User> getUsers() { return userRepository.findAll(); }

    // ── DELETE user ──────────────────────────────────────────────────────────
    @DeleteMapping("/users/{phone}")
    public ResponseEntity<?> deleteUser(@PathVariable String phone) {
        Optional<User> opt = userRepository.findByPhone(phone);
        if (opt.isEmpty()) return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
        userRepository.delete(opt.get());
        resetRepo.findByPhone(phone).ifPresent(resetRepo::delete);
        return ResponseEntity.ok(Map.of("message", "User deleted"));
    }

    // ── GET pending reset requests ───────────────────────────────────────────
    @GetMapping("/reset-requests")
    public List<PasswordResetRequest> getPendingResets() {
        return resetRepo.findAllByApprovedFalse();
    }

    // ── APPROVE reset request ────────────────────────────────────────────────
    @PostMapping("/approve-reset/{phone}")
    public ResponseEntity<?> approveReset(@PathVariable String phone) {
        Optional<PasswordResetRequest> opt = resetRepo.findByPhone(phone);
        if (opt.isEmpty()) return ResponseEntity.badRequest().body(Map.of("error", "No reset request found"));
        PasswordResetRequest req = opt.get();
        req.setApproved(true);
        resetRepo.save(req);
        return ResponseEntity.ok(Map.of("message", "Approved"));
    }

    // ── CHANGE admin password (DB-backed) ────────────────────────────────────
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> body) {
        String current = body.get("currentPassword"), newPass = body.get("newPassword");
        AdminConfig admin = getAdmin();
        if (!admin.getPassword().equals(current))
            return ResponseEntity.badRequest().body(Map.of("error", "Current password is incorrect"));
        if (newPass == null || newPass.length() < 8)
            return ResponseEntity.badRequest().body(Map.of("error", "New password must be at least 8 characters"));
        admin.setPassword(newPass);
        adminConfigRepo.save(admin);
        return ResponseEntity.ok(Map.of("message", "Password updated"));
    }

    // ── CHANGE admin phone (DB-backed) ───────────────────────────────────────
    @PostMapping("/change-phone")
    public ResponseEntity<?> changePhone(@RequestBody Map<String, String> body) {
        String newPhone = body.get("newPhone");
        if (newPhone == null || newPhone.length() != 10)
            return ResponseEntity.badRequest().body(Map.of("error", "Phone must be 10 digits"));
        if (userRepository.existsByPhone(newPhone))
            return ResponseEntity.badRequest().body(Map.of("error", "This number is already registered as a user"));
        AdminConfig admin = getAdmin();
        admin.setPhone(newPhone);
        adminConfigRepo.save(admin);
        return ResponseEntity.ok(Map.of("message", "Phone updated"));
    }

    // ── GET admin profile info ───────────────────────────────────────────────
    @GetMapping("/info")
    public ResponseEntity<?> getAdminInfo() {
        AdminConfig admin = getAdmin();
        return ResponseEntity.ok(Map.of("name", "Raja", "phone", admin.getPhone()));
    }

    // ── UPDATE user photo (DB-backed) ────────────────────────────────────────
    @PostMapping("/users/{phone}/photo")
    public ResponseEntity<?> updateUserPhoto(@PathVariable String phone, @RequestBody Map<String, String> body) {
        Optional<User> opt = userRepository.findByPhone(phone);
        if (opt.isEmpty()) return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
        User user = opt.get();
        user.setPhoto(body.get("photo")); // null to delete
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Photo updated"));
    }

    // ── GET user photo by name ───────────────────────────────────────────────
    @GetMapping("/users/photo/{name}")
    public ResponseEntity<?> getUserPhoto(@PathVariable String name) {
        return userRepository.findAll().stream()
            .filter(u -> u.getName().equals(name))
            .findFirst()
            .map(u -> ResponseEntity.ok(Map.of("photo", u.getPhoto() != null ? u.getPhoto() : "")))
            .orElse(ResponseEntity.ok(Map.of("photo", "")));
    }
}
