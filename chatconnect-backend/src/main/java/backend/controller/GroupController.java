package backend.controller;

import backend.model.Group;
import backend.model.Message;
import backend.repository.GroupRepository;
import backend.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/groups")
@CrossOrigin(origins = "*")
public class GroupController {

    @Autowired private GroupRepository groupRepository;
    @Autowired private MessageRepository messageRepository;
    @Autowired private SimpMessagingTemplate messagingTemplate;

    // ── Create group ─────────────────────────────────────────────────────────
    @PostMapping
    public ResponseEntity<?> createGroup(@RequestBody Map<String, Object> body) {
        String name      = (String) body.get("name");
        String createdBy = (String) body.get("createdBy");
        @SuppressWarnings("unchecked")
        List<String> members = (List<String>) body.get("members");

        if (name == null || name.trim().isEmpty())
            return ResponseEntity.badRequest().body(Map.of("error", "Group name required"));
        if (members == null || members.size() < 2)
            return ResponseEntity.badRequest().body(Map.of("error", "Select at least 2 members"));

        // Always include creator
        if (!members.contains(createdBy)) members.add(0, createdBy);

        String id      = UUID.randomUUID().toString();
        String members2 = String.join(",", members);
        Group group    = new Group(id, name.trim(), createdBy, members2);
        groupRepository.save(group);

        // Notify all members via websocket
        messagingTemplate.convertAndSend("/topic/groupUpdate", Map.of("action", "created", "group", Map.of(
            "id", group.getId(), "name", group.getName(), "createdBy", group.getCreatedBy(), "members", members2
        )));

        return ResponseEntity.ok(group);
    }

    // ── Get groups for a user ────────────────────────────────────────────────
    @GetMapping("/user/{name}")
    public List<Group> getGroupsForUser(@PathVariable String name) {
        // Filter strictly — check comma-separated list
        return groupRepository.findAll().stream()
            .filter(g -> Arrays.asList(g.getMembers().split(",")).contains(name))
            .toList();
    }

    // ── Rename group ─────────────────────────────────────────────────────────
    @PutMapping("/{id}/name")
    public ResponseEntity<?> renameGroup(@PathVariable String id, @RequestBody Map<String, String> body) {
        Optional<Group> opt = groupRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        String newName = body.get("name");
        if (newName == null || newName.trim().isEmpty())
            return ResponseEntity.badRequest().body(Map.of("error", "Name required"));
        Group group = opt.get();
        group.setName(newName.trim());
        groupRepository.save(group);
        messagingTemplate.convertAndSend("/topic/groupUpdate", Map.of("action", "renamed",
            "group", Map.of("id", id, "name", newName.trim(), "createdBy", group.getCreatedBy(), "members", group.getMembers())
        ));
        return ResponseEntity.ok(group);
    }

    // ── Delete group (admin only, no auth check here — frontend enforces) ────
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteGroup(@PathVariable String id) {
        if (!groupRepository.existsById(id)) return ResponseEntity.notFound().build();
        groupRepository.deleteById(id);
        messagingTemplate.convertAndSend("/topic/groupUpdate", Map.of("action", "deleted", "groupId", id));
        return ResponseEntity.ok(Map.of("ok", true));
    }
}
