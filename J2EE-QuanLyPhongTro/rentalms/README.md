# RentalMS 2.0

Mini production-grade intern project cho he thong quan ly phong tro.

## Monorepo layout

```text
rentalms/
|-- src/                # Spring Boot backend
|-- frontend/           # React SPA scaffold (Vite)
|-- docker-compose.yml  # Local stack: backend + frontend + MySQL
|-- Dockerfile.backend
|-- .env.example
```

## Actors

- `OWNER`: duy nhat 1 tai khoan, quan ly building/room/contract/bill va assign manager
- `MANAGER`: thao tac theo building duoc assign
- `TENANT`: user cuoi, gui rental request, xem bill/contract, gui maintenance
- `ADMIN`: quan tri web, user, audit, report

## API strategy

- API cu duoi `/api/...` duoc giu lai cho migration
- API moi duoi `/api/v1/...`
- Moi response moi dung `ApiResponse<T>` co `success`, `message`, `data`, `errors`, `status`, `timestamp`

## New backend capabilities

- Self-register chi tao `TENANT`
- `/api/v1/owner/...` cho owner workflows
- `/api/v1/manager/...` cho building assignment, meter reading, bill support
- `/api/v1/tenant/...` cho rental request, bills, maintenance
- `/api/v1/admin/...` cho web administration
- `/api/v1/payments/momo/...` cho MoMo sandbox order + IPN
- `BuildingManagerAssignment`, `MeterReading`, `TenantCredit`, `PaymentAllocation`
- Contract activation flow offline: create pending -> owner activate -> room occupied
- Bill support cho partial pay, overpay credit, cash confirmation

## Local development

### Backend

```bash
mvn spring-boot:run
```

Neu may khong co `mvn` trong PATH, co the dung Maven binary da co san trong local environment.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Docker compose

```bash
copy .env.example .env
docker compose up --build
```

## Demo accounts

| Role    | Email                | Password   |
|---------|----------------------|------------|
| Admin   | admin@rentalms.com   | admin123   |
| Owner   | owner@rentalms.com   | owner123   |
| Manager | manager@rentalms.com | manager123 |
| Tenant  | tenant1@rentalms.com | tenant123  |
| Tenant  | tenant2@rentalms.com | tenant123  |

## Environment variables

Copy `.env.example` thanh `.env` va dien:

- MySQL connection
- JWT secret
- Cloudinary config
- MoMo sandbox config

## Notes

- `ADMIN` khong duoc can thiep truc tiep endpoint nghiep vu building/room/contract/bill moi
- `MANAGER` duoc assign theo building, khong assign theo room
- Frontend React hien dang o pha scaffold de migration song song voi HTML cu
