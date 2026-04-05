package com.rentalms.controller.v1;

import com.rentalms.dto.ApiResponse;
import com.rentalms.dto.v1.CommonViewDTO;
import com.rentalms.enums.RoomStatus;
import com.rentalms.repository.BuildingRepository;
import com.rentalms.repository.RoomRepository;
import com.rentalms.exception.NotFoundException;
import com.rentalms.service.ViewMapperService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/marketplace")
@RequiredArgsConstructor
public class V1MarketplaceController {

    private final BuildingRepository buildingRepository;
    private final RoomRepository roomRepository;
    private final ViewMapperService viewMapperService;

    @GetMapping("/buildings")
    public ResponseEntity<ApiResponse<List<CommonViewDTO.BuildingSummary>>> searchBuildings(
            @RequestParam(defaultValue = "") String keyword) {
        return ResponseEntity.ok(ApiResponse.ok(
                buildingRepository.searchPublic(keyword).stream().map(viewMapperService::toBuildingSummary).toList()
        ));
    }

    /** Danh sách phòng AVAILABLE thuộc building PUBLIC, sort giá tăng dần */
    @GetMapping("/rooms")
    public ResponseEntity<ApiResponse<List<CommonViewDTO.MarketplaceRoomSummaryView>>> publicRooms() {
        return ResponseEntity.ok(ApiResponse.ok(
                roomRepository.findPublicAvailableRoomsOrderByPriceAsc(RoomStatus.AVAILABLE).stream()
                        .map(viewMapperService::toMarketplaceRoomSummary)
                        .toList()
        ));
    }

    @GetMapping("/rooms/{id}")
    public ResponseEntity<ApiResponse<CommonViewDTO.MarketplaceRoomDetailView>> roomDetail(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(
                viewMapperService.toMarketplaceRoomDetail(
                        roomRepository.findPublicRoomById(id)
                                .orElseThrow(() -> new NotFoundException("Khong tim thay phong public"))
                )
        ));
    }

    @GetMapping("/buildings/{id}/rooms")
    public ResponseEntity<ApiResponse<List<CommonViewDTO.MarketplaceRoomSummaryView>>> publicBuildingRooms(@PathVariable Long id) {
        buildingRepository.findById(id)
                .filter(building -> "PUBLIC".equalsIgnoreCase(building.getPublishStatus()))
                .orElseThrow(() -> new NotFoundException("Khong tim thay building public"));
        return ResponseEntity.ok(ApiResponse.ok(
                roomRepository.findAvailablePublicRoomsByBuildingId(id).stream()
                        .map(viewMapperService::toMarketplaceRoomSummary)
                        .toList()
        ));
    }
}
