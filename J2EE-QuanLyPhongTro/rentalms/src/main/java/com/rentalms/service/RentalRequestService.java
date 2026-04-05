package com.rentalms.service;

import com.rentalms.dto.ContractDTO;
import com.rentalms.dto.RentalRequestDTO;
import com.rentalms.entity.RentalRequest;
import com.rentalms.entity.Room;
import com.rentalms.entity.User;
import com.rentalms.enums.NotificationType;
import com.rentalms.enums.RentalRequestStatus;
import com.rentalms.enums.RoomStatus;
import com.rentalms.exception.BusinessException;
import com.rentalms.exception.NotFoundException;
import com.rentalms.repository.RentalRequestRepository;
import com.rentalms.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RentalRequestService {

    private final RentalRequestRepository rentalRequestRepo;
    private final RoomRepository roomRepo;
    private final UserService userService;
    private final ContractService contractService;
    private final AuditService auditService;
    private final NotificationService notificationService;
    private final AccessControlService accessControlService;

    @Transactional
    public RentalRequestDTO.Response apply(RentalRequestDTO.CreateRequest req, Long tenantId) {
        Room room = roomRepo.findById(req.getRoomId())
                .orElseThrow(() -> new NotFoundException("Khong tim thay phong"));

        if (room.getStatus() != RoomStatus.AVAILABLE) {
            throw new BusinessException("Phong hien khong co san de dang ky thue");
        }

        if (rentalRequestRepo.existsByRoomIdAndTenantIdAndStatus(
                req.getRoomId(), tenantId, RentalRequestStatus.PENDING)) {
            throw new BusinessException("Ban da gui yeu cau thue phong nay roi");
        }

        if (req.getStartDate() == null || req.getEndDate() == null
                || !req.getEndDate().isAfter(req.getStartDate())) {
            throw new BusinessException("Ngay bat dau va ket thuc khong hop le");
        }

        User tenant = userService.findById(tenantId);

        RentalRequest request = RentalRequest.builder()
                .room(room)
                .tenant(tenant)
                .startDate(req.getStartDate())
                .endDate(req.getEndDate())
                .note(req.getNote())
                .build();

        request = rentalRequestRepo.save(request);
        auditService.log(tenantId, tenant.getEmail(), "CREATE", "RentalRequest", request.getId(),
                "Yeu cau thue phong: " + room.getRoomNo());

        try {
            notificationService.notify(
                    room.getBuilding().getOwner(),
                    NotificationType.RENTAL_REQUEST_SUBMITTED,
                    "Yeu cau thue phong moi",
                    tenant.getFullName() + " vua gui yeu cau thue phong "
                            + room.getRoomNo() + " - " + room.getBuilding().getName(),
                    "RentalRequest", request.getId());
        } catch (Exception e) {
            log.warn("Could not send RENTAL_REQUEST_SUBMITTED notification: {}", e.getMessage());
        }

        return toResponse(request);
    }

    @Transactional
    public RentalRequestDTO.Response approve(Long requestId, Long ownerId) {
        RentalRequest request = findById(requestId);
        accessControlService.assertOwnerOwnsBuilding(userService.findById(ownerId), request.getRoom().getBuilding());

        if (request.getStatus() != RentalRequestStatus.PENDING) {
            throw new BusinessException("Yeu cau khong o trang thai PENDING");
        }

        ContractDTO.CreateRequest contractReq = new ContractDTO.CreateRequest();
        contractReq.setRoomId(request.getRoom().getId());
        contractReq.setTenantId(request.getTenant().getId());
        contractReq.setStartDate(request.getStartDate());
        contractReq.setEndDate(request.getEndDate());
        contractReq.setMonthlyRent(request.getRoom().getPrice());
        contractService.create(contractReq, ownerId);

        List<RentalRequest> others = rentalRequestRepo.findByRoomId(request.getRoom().getId());
        for (RentalRequest other : others) {
            if (!other.getId().equals(requestId) && other.getStatus() == RentalRequestStatus.PENDING) {
                other.setStatus(RentalRequestStatus.REJECTED);
                rentalRequestRepo.save(other);
                try {
                    notificationService.notify(
                            other.getTenant(),
                            NotificationType.RENTAL_REQUEST_REJECTED,
                            "Yeu cau thue phong khong duoc chap nhan",
                            "Yeu cau thue phong " + other.getRoom().getRoomNo()
                                    + " - " + other.getRoom().getBuilding().getName()
                                    + " da bi tu choi vi phong da co nguoi thue.",
                            "RentalRequest", other.getId());
                } catch (Exception e) {
                    log.warn("Could not send rejection notification to tenant {}: {}", other.getTenant().getId(), e.getMessage());
                }
            }
        }

        request.setStatus(RentalRequestStatus.APPROVED);
        request = rentalRequestRepo.save(request);
        auditService.log(ownerId, null, "APPROVE", "RentalRequest", requestId,
                "Duyet yeu cau thue phong " + request.getRoom().getRoomNo());

        try {
            notificationService.notify(
                    request.getTenant(),
                    NotificationType.RENTAL_REQUEST_APPROVED,
                    "Yeu cau thue phong duoc duyet",
                    "Yeu cau thue phong " + request.getRoom().getRoomNo()
                            + " - " + request.getRoom().getBuilding().getName()
                            + " da duoc chap thuan. Hop dong dang cho xac nhan offline.",
                    "RentalRequest", request.getId());
        } catch (Exception e) {
            log.warn("Could not send RENTAL_REQUEST_APPROVED notification: {}", e.getMessage());
        }

        return toResponse(request);
    }

    @Transactional
    public RentalRequestDTO.Response reject(Long requestId, Long ownerId) {
        RentalRequest request = findById(requestId);
        accessControlService.assertOwnerOwnsBuilding(userService.findById(ownerId), request.getRoom().getBuilding());

        if (request.getStatus() != RentalRequestStatus.PENDING) {
            throw new BusinessException("Yeu cau khong o trang thai PENDING");
        }

        request.setStatus(RentalRequestStatus.REJECTED);
        request = rentalRequestRepo.save(request);
        auditService.log(ownerId, null, "REJECT", "RentalRequest", requestId,
                "Tu choi yeu cau thue phong " + request.getRoom().getRoomNo());

        try {
            notificationService.notify(
                    request.getTenant(),
                    NotificationType.RENTAL_REQUEST_REJECTED,
                    "Yeu cau thue phong bi tu choi",
                    "Yeu cau thue phong " + request.getRoom().getRoomNo()
                            + " - " + request.getRoom().getBuilding().getName()
                            + " da bi tu choi boi chu nha.",
                    "RentalRequest", request.getId());
        } catch (Exception e) {
            log.warn("Could not send RENTAL_REQUEST_REJECTED notification: {}", e.getMessage());
        }

        return toResponse(request);
    }

    @Transactional(readOnly = true)
    public List<RentalRequestDTO.Response> getByTenant(Long tenantId) {
        return rentalRequestRepo.findByTenantIdOrderByCreatedAtDesc(tenantId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RentalRequestDTO.Response> getByOwner(Long ownerId) {
        return rentalRequestRepo.findByOwnerId(ownerId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RentalRequest> getByOwner(Long ownerId, RentalRequestStatus status) {
        return rentalRequestRepo.findByOwnerIdAndOptionalStatus(ownerId, status);
    }

    private RentalRequest findById(Long id) {
        return rentalRequestRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Khong tim thay yeu cau thue id: " + id));
    }

    private RentalRequestDTO.Response toResponse(RentalRequest r) {
        return RentalRequestDTO.Response.builder()
                .id(r.getId())
                .roomId(r.getRoom().getId())
                .roomNo(r.getRoom().getRoomNo())
                .buildingName(r.getRoom().getBuilding().getName())
                .tenantId(r.getTenant().getId())
                .tenantName(r.getTenant().getFullName())
                .tenantEmail(r.getTenant().getEmail())
                .startDate(r.getStartDate())
                .endDate(r.getEndDate())
                .note(r.getNote())
                .status(r.getStatus().name())
                .monthlyRent(r.getRoom().getPrice())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
