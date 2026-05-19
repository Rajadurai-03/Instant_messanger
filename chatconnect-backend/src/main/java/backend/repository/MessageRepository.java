package backend.repository;

import backend.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {

    // Direct messages between two users
    @Query("SELECT m FROM Message m WHERE " +
           "((m.sender = :a AND m.receiver = :b) OR (m.sender = :b AND m.receiver = :a)) " +
           "AND m.groupId IS NULL AND m.deleted = false ORDER BY m.id ASC")
    List<Message> findConversation(@Param("a") String a, @Param("b") String b);

    // Group messages
    @Query("SELECT m FROM Message m WHERE m.groupId = :groupId AND m.deleted = false ORDER BY m.id ASC")
    List<Message> findGroupMessages(@Param("groupId") String groupId);

    // All direct messages for a user (to build sidebar)
    @Query("SELECT m FROM Message m WHERE (m.sender = :user OR m.receiver = :user) AND m.groupId IS NULL AND m.deleted = false")
    List<Message> findAllForUser(@Param("user") String user);
}
