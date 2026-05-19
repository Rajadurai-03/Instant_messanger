package backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "admin_config")
public class AdminConfig {

    @Id
    private Long id = 1L; // single-row table

    @Column(nullable = false, length = 10)
    private String phone;

    @Column(nullable = false)
    private String password;

    public AdminConfig() {}

    public AdminConfig(String phone, String password) {
        this.id = 1L;
        this.phone = phone;
        this.password = password;
    }

    public Long getId() { return id; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
