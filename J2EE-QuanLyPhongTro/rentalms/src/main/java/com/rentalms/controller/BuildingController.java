package com.rentalms.controller;

import com.rentalms.config.CurrentUser;
import com.rentalms.dto.ApiResponse;
import com.rentalms.dto.BuildingDTO;
import com.rentalms.entity.Building;
import com.rentalms.entity.Room;
import com.rentalms.service.BuildingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/buildings")
@RequiredArgsConstructor
public class BuildingController {

    private final BuildingService buildingService;
    private final CurrentUser currentUser;

    @PostMapping
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<Building>> create(
            @Valid @RequestBody BuildingDTO.CreateRequest req) {
        return ResponseEntity.status(201)
                .body(ApiResponse.ok("Tao khu tro thanh cong",
                        buildingService.create(req, currentUser.getId())));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('OWNER','MANAGER')")
    public ResponseEntity<ApiResponse<List<Building>>> getMyBuildings() {
        return ResponseEntity.ok(ApiResponse.ok(
                buildingService.getByOwner(currentUser.getId())));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Building>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(buildingService.findById(id)));
    }

    @PutMapping("/{id}/shape")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<Building>> updateShape(
            @PathVariable Long id, @RequestBody Map<String, String> body) {
        Building updated = buildingService.updateShape(id, body.get("geoJson"), currentUser.getId());
        return ResponseEntity.ok(ApiResponse.ok("Cap nhat map thanh cong", updated));
    }

    @PutMapping("/{id}/publish")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<Building>> publish(
            @PathVariable Long id, @RequestBody Map<String, String> body) {
        Building updated = buildingService.publish(id, body.get("status"), currentUser.getId());
        return ResponseEntity.ok(ApiResponse.ok("Cap nhat trang thai thanh cong", updated));
    }

    // === ROOM endpoints ===

    @GetMapping("/{buildingId}/rooms")
    @PreAuthorize("hasAnyRole('OWNER','MANAGER')")
    public ResponseEntity<ApiResponse<List<Room>>> getRooms(@PathVariable Long buildingId) {
        List<Room> rooms = buildingService.getRooms(buildingId, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.ok(rooms));
    }

    @PostMapping("/{buildingId}/rooms")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<Room>> createRoom(
            @PathVariable Long buildingId,
            @Valid @RequestBody BuildingDTO.RoomCreateRequest req) {
        Room room = buildingService.createRoom(buildingId, req, currentUser.getId());
        return ResponseEntity.status(201).body(ApiResponse.ok("Tao phong thanh cong", room));
    }

    @PutMapping("/{buildingId}/rooms/{roomId}/media")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<Room>> updateRoomMedia(
            @PathVariable Long buildingId,
            @PathVariable Long roomId,
            @RequestBody Map<String, String> body) {
        Room room = buildingService.updateRoomMedia(
                buildingId, roomId,
                body.get("imageUrl"), body.get("videoUrl"),
                currentUser.getId());
        return ResponseEntity.ok(ApiResponse.ok("Cap nhat anh/video thanh cong", room));
    }

    @PostMapping("/{buildingId}/rooms/bulk")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<List<Room>>> bulkCreateRooms(
            @PathVariable Long buildingId,
            @Valid @RequestBody BuildingDTO.BulkRoomRequest req) {
        List<Room> rooms = buildingService.bulkCreateRooms(buildingId, req, currentUser.getId());
        return ResponseEntity.status(201)
                .body(ApiResponse.ok("Tao " + rooms.size() + " phong thanh cong", rooms));
    }
}
