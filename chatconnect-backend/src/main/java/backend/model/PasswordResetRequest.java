package backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "password_reset_requests")
public class PasswordResetRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String phone;

    @Column(nullable = false)
    private String name;

    // false = pending, true = admin approved
    @Column(nullable = false)
    private boolean approved = false;

    public PasswordResetRequest() {}

    public PasswordResetRequest(String phone, String name) {
        this.phone = phone;
        this.name = name;
    }

    public Long getId() { return id; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public boolean isApproved() { return approved; }
    public void setApproved(boolean approved) { this.approved = approved; }
}
