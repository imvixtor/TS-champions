package com.example.football_manager.modules.core.controller;

import com.example.football_manager.common.baseEntity.Enum.Role;
import com.example.football_manager.modules.auth.dto.RegisterCoachRequest;
import com.example.football_manager.modules.auth.entity.User;
import com.example.football_manager.modules.auth.repository.UserRepository;
import com.example.football_manager.modules.team.entity.Team;
import com.example.football_manager.modules.team.repository.TeamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/champions/admin")
@RequiredArgsConstructor
public class AdminController {

    private final TeamRepository teamRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;


    @PostMapping("/create-coach")
    @PreAuthorize("hasAnyAuthority('ADMIN')")
    public ResponseEntity<?> createCoachAccount(@RequestBody RegisterCoachRequest request) {

        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("Username '" + request.getUsername() + "' đã tồn tại!");
        }

        Team team = teamRepository.findById(request.getTeamId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đội bóng!"));

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.COACH);
        user.setTeam(team);

        userRepository.save(user);

        if (team.getCoachName() == null || team.getCoachName().isEmpty()) {
            team.setCoachName(request.getUsername());
            teamRepository.save(team);
        }

        return ResponseEntity.ok("Tạo tài khoản HLV thành công!");
    }
}