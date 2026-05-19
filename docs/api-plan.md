# 베프(BEFF) 사용자 앱 API 연동 계획

현재 사용자 앱은 Mock 데이터 기반입니다. 아래 API는 백엔드 추가 시 연결할 후보이며, 실제 엔드포인트명은 백엔드 설계 과정에서 조정할 수 있습니다.

## 공통 원칙

- 사용자 앱은 데이터 호출을 한 곳에 모은 서비스 계층(예: `src/services/api.ts`)을 통해서만 데이터를 받도록 구성합니다.
- 페이지 컴포넌트에서 `fetch`를 직접 호출하지 않습니다.
- 위치·연락처·장애 관련 민감정보는 전송·저장 시 암호화하고 최소 권한으로만 접근합니다.
- 사용자 변경성 작업(매칭 신청/취소, 시설 신고, SOS 호출)은 감사 로그를 남길 수 있게 설계합니다.
- 실 운영에서는 학교 이메일 인증과 모바일 OTP가 선행되어야 합니다.

## 화면별 API 후보

| 화면 | 기능 | Method | Endpoint 후보 | 상태 |
|---|---|---:|---|---|
| 홈 | 사용자 요약(닉네임/알림 수) | GET | `/api/users/me/summary` | 백엔드 추가 필요 |
| 홈 | 히어로 배너 | GET | `/api/banners?placement=home_hero` | 백엔드 추가 필요 |
| 홈 | 인기 관심 분야 TOP N | GET | `/api/match-categories/top` | 백엔드 추가 필요 |
| 홈 | 마감 임박 활동 | GET | `/api/activities?status=deadline_soon` | 백엔드 추가 필요 |
| 홈 | 실시간 인기글 | GET | `/api/community/posts?sort=hot` | 백엔드 추가 필요 |
| 홈 | 교내 소식 | GET | `/api/campus-news?limit=3` | 백엔드 추가 필요 |
| 홈 | 대외활동 | GET | `/api/external-activities?limit=3` | 백엔드 추가 필요 |
| 지도 | 시설 목록(필터) | GET | `/api/facilities?category=&accessible=` | 백엔드 추가 필요 |
| 지도 | 시설 상세 | GET | `/api/facilities/{facilityId}` | 백엔드 추가 필요 |
| 지도 | 경로 안내(Tmap 프록시) | GET | `/api/routes/walking?from=&to=` | 백엔드 추가 필요 |
| 지도 | 시설 즐겨찾기 | POST | `/api/users/me/favorites/facilities/{facilityId}` | 백엔드 추가 필요 |
| 지도 | 시설 사용자 신고 | POST | `/api/facilities/{facilityId}/reports` | 백엔드 추가 필요 |
| 매칭 | 동행 요청 목록 | GET | `/api/matches/requests` | 백엔드 추가 필요 |
| 매칭 | 동행 제공 목록 | GET | `/api/matches/offers` | 백엔드 추가 필요 |
| 매칭 | 동행 등록 | POST | `/api/matches` | 백엔드 추가 필요 |
| 매칭 | 동행 신청 | POST | `/api/matches/{matchId}/apply` | 백엔드 추가 필요 |
| 매칭 | 내 매칭 목록 | GET | `/api/users/me/matches` | 백엔드 추가 필요 |
| 매칭 | 매칭 상태 변경 | PATCH | `/api/matches/{matchId}/status` | 백엔드 추가 필요 |
| 매칭 | 활동 후 만족도/회고 | POST | `/api/matches/{matchId}/reviews` | 백엔드 추가 필요 |
| 프로필 | 내 프로필 | GET | `/api/users/me` | 백엔드 추가 필요 |
| 프로필 | 프로필 수정 | PATCH | `/api/users/me` | 백엔드 추가 필요 |
| 프로필 | 접근 프로파일 저장 | PATCH | `/api/users/me/access-profile` | 백엔드 추가 필요 |
| 프로필 | 봉사시간 요약 | GET | `/api/users/me/volunteer-summary` | 백엔드 추가 필요 |
| 프로필 | 활동확인서 발급 | POST | `/api/users/me/certificates` | 백엔드 추가 필요 |
| 프로필 | 활동확인서 다운로드 | GET | `/api/users/me/certificates/{certId}/download` | 백엔드 추가 필요 |
| 프로필 | 친구 목록 | GET | `/api/users/me/friends` | 백엔드 추가 필요 |
| 프로필 | 알림/접근성 설정 저장 | PATCH | `/api/users/me/preferences` | 백엔드 추가 필요 |
| SOS | 긴급 호출 전송 | POST | `/api/sos/calls` | 백엔드 추가 필요 |
| SOS | 호출 대상(보호자/지원센터/보안실) 목록 | GET | `/api/users/me/sos-targets` | 백엔드 추가 필요 |
| 인증 | 학교 이메일 인증 시작 | POST | `/api/auth/email/start` | 백엔드 추가 필요 |
| 인증 | 학교 이메일 인증 확인 | POST | `/api/auth/email/verify` | 백엔드 추가 필요 |
| 알림 | 푸시 토큰 등록 | POST | `/api/users/me/push-tokens` | 백엔드 추가 필요 |

## 외부 공공데이터 활용 (백엔드 경유 권장)

- 전국장애인편의시설표준데이터 (한국사회보장정보원) → 시설 시드 데이터
- 한국장애인고용공단 BF 인증 시설 → 시설 신뢰도 배지
- 서울특별시 지하철역 엘리베이터/리프트 → 외부 이동 동선
- Tmap 보행자 경로안내 API → 지도 길찾기
- 전국교통약자이동지원센터 → SOS 호출 대상 데이터
- 한국관광공사 무장애 여행 / Visit Seoul → 대외활동 카테고리
- KOPIS 공연예술통합전산망 → 문화·예술 매칭 추천
- 과학기술정보통신부 사업공고 API → 대외활동 카드

## 데이터 연동 구조

현재 구조:

```text
컴포넌트 내부 mock 상수 → 페이지
```

백엔드 연동 후 예상 구조:

```text
백엔드 API → src/services/api.ts → src/app/components/*
```

페이지를 갈아엎지 않고 서비스 계층부터 교체하는 방식이 권장됩니다.

## 백엔드 연동 시 프론트 수정 순서

1. 인증(학교 이메일/OTP) API 연결.
2. 사용자/프로필/접근 프로파일 API 연결 후 프로필 화면 실데이터화.
3. 시설/매칭 목록 API 연결 후 상세·신청 흐름 검증.
4. SOS 호출 API와 푸시 알림 연동.
5. 활동확인서 발급(파일 생성/다운로드) 연결.
6. 만족도·회고·매너 평가 저장 연결.
7. 로딩/에러/빈 상태와 권한 분기(이용자/제공자) 적용.
