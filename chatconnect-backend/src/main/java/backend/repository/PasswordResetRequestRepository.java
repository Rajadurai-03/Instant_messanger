package backend.repository;

import backend.model.PasswordResetRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PasswordResetRequestRepository extends JpaRepository<PasswordResetRequest, Long> {

    Optional<PasswordResetRequest> findByPhone(String phone);

    boolean existsByPhone(String phone);

    List<PasswordResetRequest> findAllByApprovedFalse();
}
