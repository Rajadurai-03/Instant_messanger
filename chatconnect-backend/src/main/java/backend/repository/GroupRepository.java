package backend.repository;

import backend.model.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface GroupRepository extends JpaRepository<Group, String> {

    // Find all groups where this user is a member (members stored as comma-separated)
    @Query("SELECT g FROM Group g WHERE g.members LIKE %:name%")
    List<Group> findGroupsForMember(@Param("name") String name);
}
