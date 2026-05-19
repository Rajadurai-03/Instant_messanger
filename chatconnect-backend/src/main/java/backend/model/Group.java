package backend.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "chat_groups")
public class Group {

    @Id
    @Column(length = 36)
    private String id;  // UUID

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String createdBy;

    // Comma-separated member names
    @Column(columnDefinition = "TEXT")
    private String members;

    public Group() {}

    public Group(String id, String name, String createdBy, String members) {
        this.id = id;
        this.name = name;
        this.createdBy = createdBy;
        this.members = members;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public String getMembers() { return members; }
    public void setMembers(String members) { this.members = members; }
}
