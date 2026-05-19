package backend.controller;

import backend.model.Message;
import backend.repository.MessageRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Controller
@CrossOrigin(origins = "*")
public class ChatController {

    @Autowired private MessageRepository messageRepository;
    @Autowired private SimpMessagingTemplate messagingTemplate;
    @Autowired private ObjectMapper objectMapper;

    // ── WebSocket: receive JSON string, parse manually, save, broadcast ───────
    @MessageMapping("/sendMessage")
    @SendTo("/topic/messages")
    public Message sendMessage(@Payload String payload) throws Exception {
        Message message = objectMapper.readValue(payload, Message.class);
        return messageRepository.save(message);
    }

    // ── WebSocket: typing indicator ───────────────────────────────────────────
    @MessageMapping("/typing")
    @SendTo("/topic/typing")
    public String typing(@Payload String payload) {
        return payload;
    }

    // ── REST: get conversation between two users ──────────────────────────────
    @GetMapping("/api/messages/conversation")
    @ResponseBody
    public List<Message> getConversation(@RequestParam String a, @RequestParam String b) {
        return messageRepository.findConversation(a, b);
    }

    // ── REST: get group messages ──────────────────────────────────────────────
    @GetMapping("/api/messages/group/{groupId}")
    @ResponseBody
    public List<Message> getGroupMessages(@PathVariable String groupId) {
        return messageRepository.findGroupMessages(groupId);
    }

    // ── REST: get all contacts for sidebar ────────────────────────────────────
    @GetMapping("/api/messages/contacts/{user}")
    @ResponseBody
    public List<Message> getUserMessages(@PathVariable String user) {
        return messageRepository.findAllForUser(user);
    }

    // ── REST: mark messages as read ───────────────────────────────────────────
    @PostMapping("/api/messages/read")
    @ResponseBody
    public ResponseEntity<?> markRead(@RequestBody Map<String, String> body) {
        String from = body.get("from"), to = body.get("to");
        List<Message> msgs = messageRepository.findConversation(from, to);
        msgs.stream()
            .filter(m -> m.getSender().equals(from) && !m.isRead())
            .forEach(m -> { m.setRead(true); messageRepository.save(m); });
        messagingTemplate.convertAndSend("/topic/read", Map.of("from", from, "to", to));
        return ResponseEntity.ok(Map.of("ok", true));
    }

    // ── REST: delete a message ────────────────────────────────────────────────
    @DeleteMapping("/api/messages/{id}")
    @ResponseBody
    public ResponseEntity<?> deleteMessage(@PathVariable Long id) {
        Optional<Message> opt = messageRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        Message m = opt.get();
        m.setDeleted(true);
        messageRepository.save(m);
        messagingTemplate.convertAndSend("/topic/deleted", Map.of("id", id));
        return ResponseEntity.ok(Map.of("ok", true));
    }
}
