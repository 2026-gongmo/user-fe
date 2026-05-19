# 베프(BEFF) User FE

베프 사용자 앱은 장애학생과 비장애학생이 캠퍼스의 물리적 장벽을 낮추고(무장애 지도), 사회적 고립을 줄이며(친구 매칭), 일상의 안전망(긴급 SOS 호출)과 정보·이해(커뮤니티)를 함께 가지도록 만든 공모전 시연용 React 모바일 웹입니다.

> 현재 버전은 프론트엔드 MVP입니다. 백엔드는 아직 연결되어 있지 않으며, 모든 데이터는 컴포넌트 내부 Mock 데이터입니다. 실제 저장·인증·SOS 호출 라우팅·활동확인서 PDF 생성·공공데이터 동기화는 백엔드 추가 필요 항목으로 분리했습니다.

## 현재 상태

| 구분 | 상태 |
|---|---|
| 대상 | 장애학생 + 비장애학생 (캠퍼스 사용자) |
| 구현 범위 | React + Vite + MUI + Tailwind 프론트엔드 |
| 데이터 | 각 페이지/다이얼로그 내부 Mock 상수 |
| API 계층 | 미연동 (`docs/api-plan.md` 참조) |
| 백엔드 | 미연동, Spring Boot API 추가 필요 |
| 배포/시연 | 로컬 또는 정적 호스팅 가능 |

## 기술 스택

| 영역 | 기술 |
|---|---|
| Frontend | React 18, TypeScript, Vite 6 |
| Routing | React Router HashRouter |
| UI | MUI 7 + Tailwind 4 + lucide-react |
| State | React local state |
| Data Layer | `src/data/mockData.ts` + `src/services/api.ts` mock 반환 |
| Styling | MUI sx + Tailwind 유틸 + `src/styles/globals.css` |
| Backend 예정 | Spring Boot, JPA, PostgreSQL 또는 MySQL |

## 디렉토리 구조

```text
user-fe/
├── docs/                         # 운영 문서 (api-plan, backend-todo, backend-design, demo-script, qa-checklist)
├── src/
│   ├── main.tsx                  # 진입점, HashRouter
│   ├── App.tsx                   # 라우트 정의, ThemeProvider
│   ├── types.ts                  # 공통 도메인 타입
│   ├── components/               # 공유 UI 컴포넌트
│   │   ├── Layout.tsx            # 하단 네비 + 전역 SOS FAB
│   │   ├── SosDialog.tsx
│   │   ├── AccessibilityDialog.tsx
│   │   └── ImageWithFallback.tsx
│   ├── pages/                    # 라우트별 화면
│   │   ├── HomePage.tsx
│   │   ├── MapPage.tsx
│   │   ├── MatchingPage.tsx
│   │   └── ProfilePage.tsx
│   ├── data/
│   │   └── mockData.ts           # Mock 데이터 단일 출처
│   ├── services/
│   │   └── api.ts                # Mock 반환 + API 전환 계약
│   └── styles/
│       └── globals.css           # Tailwind + 기본 CSS
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 주요 화면

| 화면 | 설명 |
|---|---|
| 홈 | 히어로 배너, 인기 관심 분야 TOP, 빠른 메뉴, SOS 안전 카드, 마감 임박 활동, 실시간 인기글, 교내 소식, 대외활동 |
| 지도 | 카테고리 필터(엘리베이터/경사로/화장실), 마커 + 하단 시트, 검색 드로어, 길찾기/저장 |
| 매칭 | 동행 요청 / 동행 제공 / 내 매칭 탭, 매칭 카드(신뢰 배지/매너 점수/봉사시간 인정), 5단계 스텝퍼, 신청·등록 다이얼로그 |
| 프로필 | 인증 배지(이메일/MOU/매너), 봉사시간·활동확인서 카드, 접근 프로파일, 친구 가로 스크롤, 접근성 설정/활동확인서/친구/프로필 수정 다이얼로그 |
| SOS 다이얼로그 | 전체화면. 호출 대상(보호자/지원센터/보안실/119) 선택, 빠른 메시지 칩, 위치 자동 표시, 전송 완료 화면 |
| 접근성 설정 | 글자 크기 슬라이더(미리보기), 고대비/모션 줄이기/스크린리더, 자막/수어/음성 해설, 언어 |

## 실행 방법

```bash
npm install
npm run dev
```

로컬 실행 주소:

```text
http://localhost:5173/
```

## 빌드 방법

```bash
npm run build
```

## 발표 시연 흐름

1. **홈** — 함께하는 활동 배너, 빠른 메뉴, SOS 안전 카드
2. **SOS 다이얼로그** — 호출 대상/메시지/위치 한 번에 전송
3. **지도** — 무장애 시설 카테고리 필터, 하단 시트 상세
4. **매칭** — 신뢰 배지·매너 점수·"완료 시 봉사 N시간 인정" 인센티브
5. **내 매칭** — 5단계 스텝퍼로 매칭 프로세스 가시화
6. **프로필** — 봉사시간 누적·활동확인서 발급·접근 프로파일·접근성 설정

## Mock 범위와 백엔드 추가 필요

| 기능 | 현재 상태 | 실제 서비스에서 필요한 작업 |
|---|---|---|
| 학교 이메일 인증 | 미구현 | Spring Security/JWT + 도메인 검증 + OTP |
| 사용자/접근 프로파일 | Mock | 사용자 CRUD API, 접근 프로파일 저장 |
| 매칭 신청/등록 | 다이얼로그 표시만 | 매칭 CRUD + 상태 머신 API |
| 봉사시간 누적 | Mock 진행률 | 매칭 완료 시 자동 적립 API |
| 활동확인서 발급 | 다이얼로그 UI만 | PDF 생성, 학교 공동 명의 발행 |
| SOS 호출 | 전송 완료 화면 토스트 | SMS/알림톡/푸시 라우팅, 응답자 배정 |
| 무장애 지도 시설 | Mock 6건 | 공공데이터 동기화, 사용자 신고 접수 |
| 친구 목록 | Mock 4명 | 친구 관계 CRUD, 메시지 |
| 알림/접근성 설정 | 토글 로컬 상태 | 사용자 환경설정 저장 |

## 데이터 연동 구조

현재 구조:

```text
컴포넌트 내부 Mock 상수 → 페이지/다이얼로그
```

백엔드 연동 후 예상 구조:

```text
Spring Boot API → src/services/api.ts → src/app/components/*
```

페이지는 서비스 계층을 통해 데이터를 받도록 분리하면, Spring Boot API 연결 시 페이지 전체를 갈아엎지 않고 서비스 계층부터 교체할 수 있습니다.

## 문서

| 문서 | 내용 |
|---|---|
| [`docs/api-plan.md`](docs/api-plan.md) | 화면별 API 연동 계획 |
| [`docs/backend-todo.md`](docs/backend-todo.md) | 백엔드 추가 필요 목록 |
| [`docs/backend-design.md`](docs/backend-design.md) | Spring Boot 백엔드 설계 초안 |
| [`docs/demo-script.md`](docs/demo-script.md) | 발표 시연 스크립트 |
| [`docs/qa-checklist.md`](docs/qa-checklist.md) | 빌드/접근성/보안 QA 체크리스트 |

## 업로드 전 주의사항

- `node_modules/`는 GitHub에 올리지 않습니다.
- `dist/`는 별도 요청이 없으면 올리지 않습니다.
- `.env`, API Key, Token, 개인정보는 포함하지 않습니다.
- 현재 화면은 Mock 데이터 기반이며 실제 학교 시스템과 연동된 상태가 아닙니다.
- README와 화면 문구에서 실제 API가 연결된 것처럼 표현하지 않습니다.
- SOS 호출 대상의 실제 전화번호는 노출하지 않습니다(Mock은 `***` 처리).
