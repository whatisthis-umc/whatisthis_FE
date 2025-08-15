# 이게뭐예요? (What is this?)

**자취생을 위한 생활꿀팁과 꿀템 공유 커뮤니티 플랫폼**

생활에 유용한 꿀팁과 꿀템을 공유하고, AI 기반 맞춤형 콘텐츠를 추천받을 수 있는 자취생 특화 웹 서비스입니다.


## 목차

- [프로젝트 소개](#-프로젝트-소개)
- [주요 기능](#-주요-기능)
- [아키텍처 & 폴더 구조](#️-아키텍처--폴더-구조)
- [기술 스택](#️-기술-스택)
- [협업 규칙](#-협업-규칙)
- [개발 중 겪은 어려움과 해결](#-개발-중-겪은-어려움과-해결)
- [AI 활용](#-ai-활용)
- [시작하기](#-시작하기)
- [팀 소개](#-팀-소개)

---

## 프로젝트 소개

**이게뭐예요?**는 자취생들이 일상에서 유용한 **생활꿀팁**과 **생활꿀템**을 쉽게 공유하고 발견할 수 있는 커뮤니티 플랫폼입니다.

### 개발 동기
- 자취생들이 겪는 생활의 어려움을 해결하고자 함
- 검증된 꿀팁과 꿀템 정보를 쉽게 찾을 수 있는 플랫폼의 필요성
- AI 기술을 활용한 개인화된 콘텐츠 추천 서비스 제공

### 타겟 사용자
- **자취생**: 생활 팁이 필요한 1인 가구
- **신혼부부**: 살림에 도움이 되는 정보를 찾는 사용자
- **생활 정보 공유자**: 유용한 팁과 제품을 알리고 싶은 사용자

---

## 주요 기능

### 메인 서비스
- **통합 검색**: 키워드 기반 통합 콘텐츠 검색
- **반응형 디자인**: 모바일/데스크톱 최적화된 UI/UX

### 생활꿀팁 (Tips)
생활에 도움이 되는 다양한 팁을 카테고리별로 제공
- **조리/주방**: 요리법, 주방 활용 팁
- **청소/분리수거**: 효과적인 청소 방법
- **욕실/청결**: 욕실 관리 및 청결 유지
- **세탁/의류관리**: 옷 관리 및 세탁 노하우
- **보관/유통기한**: 식품 보관법 및 유통기한 관리

### 생활꿀템 (Items)
실용적이고 가성비 좋은 제품 추천
- **자취 필수템**: 자취생에게 꼭 필요한 아이템
- **주방템**: 주방용품 및 조리도구
- **청소템**: 청소용품 및 도구
- **살림도구템**: 생활용품 및 수납용품
- **브랜드 꿀템**: 검증된 브랜드 제품

### 커뮤니티
- **게시글 작성/수정/삭제**: 마크다운 에디터 지원
- **댓글 시스템**: 실시간 댓글 및 대댓글
- **좋아요/스크랩**: 유용한 콘텐츠 북마크
- **신고 시스템**: 부적절한 콘텐츠 신고

### 마이페이지
- **내 게시글 관리**: 작성한 게시글 조회/편집
- **좋아요한 글**: 관심 있는 게시글 모음
- **스크랩한 글**: 북마크한 콘텐츠 관리
- **개인정보 수정**: 프로필 및 계정 설정

### 인증 시스템
- **일반 회원가입/로그인**: 이메일 기반 인증
- **소셜 로그인**: 카카오, 네이버, 구글 연동
- **아이디/비밀번호 찾기**: 이메일 인증 복구

### 관리자 기능
- **콘텐츠 관리**: 게시글/댓글 승인/삭제
- **사용자 관리**: 회원 관리 및 제재
- **신고 처리**: 신고 내용 검토 및 조치
- **공지사항 관리**: 시스템 공지 및 안내사항
- **통계 대시보드**: 서비스 이용 현황 모니터링

### 고객지원
- **공지사항**: 서비스 업데이트 및 중요 안내
- **Q&A**: 자주 묻는 질문과 답변
- **1:1 문의**: 개인별 맞춤 고객지원 (비밀글 지원)

### AI 기능
- **개인화 추천**: 사용자 관심사 기반 콘텐츠 추천
- **인기 키워드**: 실시간 트렌딩 검색어
- **스마트 카테고리**: AI 기반 콘텐츠 분류

---

## 아키텍처 & 폴더 구조

### 프론트엔드 구조
```
src/
├── 📁 api/              # API 통신 로직
│   ├── auth/         # 인증 관련 API
│   ├── dto/          # 데이터 전송 객체
│   ├── axiosInstance.ts # Axios 설정 및 인터셉터
│   └── *.ts            # 각 도메인별 API 함수
├── 📁 assets/          # 정적 리소스 (이미지, 아이콘)
├── 📁 components/      # 재사용 가능한 컴포넌트
│   ├── admin/       # 관리자 전용 컴포넌트
│   ├── common/      # 공통 컴포넌트
│   ├── customer/    # 고객지원 컴포넌트
│   └── modals/      # 모달 컴포넌트
├── 📁 constants/       # 상수 정의
├── 📁 contexts/        # React Context
├── 📁 data/           # 더미 데이터 및 설정
├── 📁 hooks/          # 커스텀 훅
│   ├── mutations/   # React Query Mutations
│   └── queries/     # React Query Queries
├── 📁 layouts/        # 레이아웃 컴포넌트
├── 📁 pages/          # 페이지 컴포넌트
│   ├── AdminPages/ # 관리자 페이지
│   ├── community/  # 커뮤니티 페이지
│   ├── customer/   # 고객지원 페이지
│   ├── items/      # 꿀템 페이지
│   ├── my/         # 마이페이지
│   └── tips/       # 꿀팁 페이지
├── 📁 routes/         # 라우팅 및 권한 관리
├── 📁 types/          # TypeScript 타입 정의
└── 📁 utils/          # 유틸리티 함수
```

### 시스템 아키텍처
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   사용자 브라우저   │◄──►│   React SPA      │◄──►│   백엔드 API     │
│   (Frontend)    │    │   (Vite + TS)   │    │   (Spring Boot) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │                         │
                              ▼                         ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │ 로컬 스토리지     │    │   데이터베이스    │
                       │ (JWT 토큰)      │    │   (MySQL)       │
                       └─────────────────┘    └─────────────────┘
```

---

## 기술 스택

### Frontend
| 구분 | 기술 | 선택 이유 |
|------|------|-----------|
| **핵심 프레임워크** | React 19 + TypeScript | • 컴포넌트 기반 개발로 재사용성 극대화<br>• 타입 안정성으로 개발 생산성 향상<br>• 풍부한 생태계와 커뮤니티 지원 |
| **빌드 도구** | Vite | • 빠른 개발 서버 및 빌드 속도<br>• HMR(Hot Module Replacement) 지원<br>• ESBuild 기반 최적화 |
| **스타일링** | TailwindCSS | • 유틸리티 클래스로 빠른 UI 개발<br>• 일관된 디자인 시스템 구축<br>• 번들 크기 최적화 (Purge CSS) |
| **상태 관리** | React Query | • 서버 상태 관리의 복잡성 해결<br>• 자동 캐싱 및 동기화<br>• 로딩/에러 상태 관리 간소화 |
| **폼 관리** | React Hook Form + Zod | • 성능 최적화된 폼 처리<br>• 타입 안전한 유효성 검사<br>• 선언적 폼 관리 |
| **HTTP 클라이언트** | Axios | • 요청/응답 인터셉터로 공통 로직 처리<br>• 자동 토큰 갱신 및 인증 관리<br>• 에러 처리 표준화 |
| **라우팅** | React Router DOM | • SPA 라우팅의 표준<br>• 중첩 라우팅 및 보호된 라우트 지원<br>• 코드 스플리팅 최적화 |
| **UI 컴포넌트** | Headless UI + Material-UI | • 접근성 최적화된 기본 컴포넌트<br>• 커스터마이징 자유도 확보<br>• 디자인 시스템 일관성 |

### 개발 도구
| 구분 | 기술 | 설명 |
|------|------|------|
| **코드 품질** | ESLint + Prettier | 코드 스타일 통일 및 오류 방지 |
| **타입 검사** | TypeScript | 컴파일 타임 오류 검출 |
| **Git 훅** | Husky + lint-staged | 커밋 전 자동 검사 |
| **패키지 매니저** | pnpm | 빠른 설치 속도 및 디스크 효율성 |

### 배포 & 인프라
- **호스팅**: Vercel (자동 배포 및 CDN)
- **환경 관리**: 환경별 설정 파일 분리

---

## 협업 규칙

### 커밋 컨벤션
```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 스타일 변경
refactor: 코드 리팩토링
test: 테스트 코드
chore: 빌드 설정 등 기타 변경사항

예시: feat: 생활꿀팁 검색 필터링 기능 추가
```

### Git Flow
- **main**: 배포 가능한 상태
- **dev**: 개발 통합 브랜치
- **feat/기능명**: 기능 개발 브랜치
- **fix/버그명**: 버그 수정 브랜치

### 코드 리뷰 기준
1. **기능 동작**: 요구사항 충족 여부
2. **코드 품질**: 가독성, 재사용성, 성능
3. **타입 안정성**: TypeScript 타입 정의 적절성
4. **UI/UX**: 반응형 디자인 및 사용성
5. **테스트**: 엣지 케이스 처리

### 컴포넌트 설계 원칙
- **단일 책임 원칙**: 하나의 기능만 담당
- **재사용성**: props 인터페이스 명확히 정의
- **접근성**: ARIA 속성 및 키보드 네비게이션
- **성능**: React.memo, useMemo 적절히 활용

---

## 개발 중 겪은 어려움과 해결

### 1. JWT 토큰 자동 갱신 시스템
**문제**: 사용자 경험을 해치지 않으면서 토큰 만료를 처리해야 함
```typescript
// 해결: Axios 인터셉터를 활용한 자동 토큰 갱신
async function refreshToken(): Promise<string> {
  const refresh = localStorage.getItem("refreshToken");
  if (!refresh) throw new Error("로그인이 필요합니다.");

  const res = await axios.post(`${baseURL}/auth/refresh`, { refreshToken: refresh });
  if (!res.data?.isSuccess) throw new Error(res.data?.message ?? "토큰 재발급 실패");

  const newAccess = res.data.result?.accessToken ?? res.data.data?.accessToken;
  localStorage.setItem("accessToken", newAccess);
  return newAccess;
}

// 응답 인터셉터에서 401/403 에러 시 자동 재시도
axiosInstance.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      const newAccess = await refreshToken();
      return retryOriginal(originalRequest, newAccess);
    }
    return Promise.reject(error);
  }
);
```

### 2. 성능 최적화 - 더보기 버튼 방식
**문제**: 대량의 게시글 데이터로 인한 렌더링 성능 저하
```typescript
// 해결: 페이지네이션과 더보기 버튼으로 점진적 로딩
const loadMoreData = useCallback(async () => {
  if (loading || !hasMore) return;

  setLoading(true);
  try {
    const nextPage = currentPage + 1;
    const result = await itemService.getAllPosts(nextPage);

    if (result.posts.length === 0) {
      setHasMore(false);
      return;
    }

    // 기존 데이터와 새 데이터 합치기 (중복 제거)
    const newPosts = result.posts.filter(
      (newPost) => !allPosts.some((existingPost) => existingPost.postId === newPost.postId)
    );

    setAllPosts((prev) => [...prev, ...newPosts]);
    setCurrentPage(nextPage);
  } catch (e) {
    console.error("Error loading more data:", e);
  } finally {
    setLoading(false);
  }
}, [loading, hasMore, currentPage, allPosts]);
```

### 3. 권한별 접근 제어
**문제**: 일반 사용자, 관리자 등 권한에 따른 라우팅 보호
```typescript
// 해결: 토큰 기반 라우트 보호
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = localStorage.getItem("adminAccessToken");

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

// 일반 사용자용 보호 라우트
export default function CommonProtectedRoute() {
  const token = localStorage.getItem("accessToken");
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
}
```

### 4. 반응형 디자인 구현
**문제**: 다양한 화면 크기에서 일관된 사용자 경험 제공
```css
/* 해결: TailwindCSS 모바일 퍼스트 접근법 */
.container {
  @apply px-4 mx-auto;
  @apply md:px-8 md:max-w-4xl;
  @apply lg:px-12 lg:max-w-6xl;
}
```

### 5. 비밀글 접근 시 로그아웃 문제
**문제**: 작성자가 아닌 사용자가 비밀글 접근 시 403 에러로 인한 자동 로그아웃
```typescript
// 해결: 특정 API에 대한 토큰 갱신 스킵 플래그 추가
export type PublicAxiosConfig = AxiosRequestConfig & {
  skipTokenRefresh?: boolean; // 403 에러 시 토큰 재발급을 시도하지 않음
};

// 비밀글 조회 시 플래그 사용
const getSupportInquiryDetail = async (inquiryId: number) => {
  return axiosInstance.get(`/support/inquiries/${inquiryId}`, {
    skipTokenRefresh: true
  });
};

// 인터셉터에서 플래그 확인
if (original?.skipTokenRefresh) return Promise.reject(error);
```

### 6. React Query 활용한 서버 상태 관리
**문제**: 복잡한 서버 상태 관리와 캐싱
```typescript
// 해결: React Query로 효율적인 데이터 페칭과 캐싱
export default function useCommunities(sort: CommunitySort = "LATEST") {
  return useInfiniteQuery({
    queryKey: ["communities", sort],
    queryFn: ({ pageParam = 0 }) =>
      getCommunities({ page: pageParam, size: 6, sort }),
    getNextPageParam: (lastPage) => {
      return lastPage.isLast ? undefined : lastPage.page + 1;
    },
    initialPageParam: 0,
  });
}
```

### 7. 에러 처리 표준화
**문제**: 일관성 없는 에러 처리로 인한 사용자 경험 저하
```typescript
// 해결: 상세한 에러 로깅과 사용자 친화적 메시지
try {
  const response = await adminNewPost(data);
  return response.data;
} catch (error: any) {
  console.error("=== adminNewPost 오류 발생 ===");
  
  if (error.response?.status === 500) {
    console.error("서버 내부 오류입니다. 백엔드 개발자에게 다음 정보를 전달하세요:");
    console.error("요청 데이터:", {
      title: data.title,
      content: data.content,
      category: data.category
    });
  }
  
  throw error;
}
```

---

## AI 활용

### 개인화 추천 시스템
```typescript
// AI 기반 게시물 추천 API
export const getAiRecommendedPosts = async (page: number, size: number) => {
  const response = await axiosInstance.get("/posts/life-tips/ai", {
    params: { page, size }
  });
  return response.data.result;
};
```

**활용 분야**:
- 사용자 관심사 기반 꿀팁/꿀템 추천
- 조회 이력 분석을 통한 맞춤형 콘텐츠 제공
- 카테고리별 인기 콘텐츠 우선 노출

### 스마트 검색
- **의미 기반 검색**: 키워드의 의미를 파악하여 관련 콘텐츠 추천
- **자동 완성**: 인기 검색어 기반 실시간 추천
- **오타 보정**: 사용자 입력 오타 자동 수정

### 콘텐츠 분석
- **자동 태깅**: 게시글 내용 분석으로 적절한 해시태그 제안
- **카테고리 추천**: 게시글 내용 기반 최적 카테고리 분류
- **품질 평가**: 콘텐츠 유용성 점수 산출

### 개발 과정에서 AI 활용
- **Claude/ChatGPT**: 복잡한 비즈니스 로직 구현 시 코드 리뷰 및 최적화
- **GitHub Copilot**: 반복적인 코드 작성 자동화
- **AI 기반 테스트**: 엣지 케이스 시나리오 생성

---

## 시작하기

### 사전 요구사항
- Node.js 18+
- pnpm 8+

### 설치 및 실행
```bash
# 1. 저장소 클론
git clone https://github.com/whatisthis-umc/whatisthis_FE.git
cd whatisthis_FE

# 2. 의존성 설치
pnpm install

# 3. 환경 변수 설정
cp .env.example .env.local
# .env.local 파일에서 API URL 등 설정

# 4. 개발 서버 시작
pnpm dev
```

### 환경 변수
```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_API_LOG=1
```

### 빌드
```bash
# 프로덕션 빌드
pnpm build

# 빌드 결과 미리보기
pnpm preview
```

---

## 기타 전달하고 싶은 내용

### 디자인 철학
- **사용자 중심**: 직관적이고 접근하기 쉬운 인터페이스
- **일관성**: 전체 서비스에서 통일된 디자인 언어
- **접근성**: 모든 사용자가 이용할 수 있는 웹 표준 준수

### 기술적 도전
- **확장성**: 마이크로 프론트엔드 아키텍처 적용 검토
- **성능**: 번들 최적화 및 코드 스플리팅
- **SEO**: SSR/SSG 도입을 통한 검색 엔진 최적화

### 향후 개선 계획
- **PWA**: 오프라인 지원 및 푸시 알림
- **다크모드**: 사용자 선호도 기반 테마 지원
- **국제화**: 다국어 지원으로 글로벌 서비스 확장

### 학습 성과
- **팀워크**: 체계적인 협업 프로세스 구축
- **문제 해결**: 실제 서비스 개발 중 발생하는 이슈 해결 경험
- **사용자 경험**: 실사용자 피드백 기반 개선 프로세스

---

## 팀 소개

### Frontend Team
- **개발 기간**: 2025.07 - 2025.08 (2개월)
- **팀 구성**: 프론트엔드 4명
- **개발 방식**: 역할 분담, 본인파트 개발 후 깃허브 리뷰, 디스코드 회의 진행

---

<div align="center">

### 자취생활을 더 스마트하게, 이게뭐예요?와 함께하세요!

[![Website](https://img.shields.io/badge/Website-이게뭐예요?-blue)](https://your-website.com)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-green)](https://github.com/whatisthis-umc/whatisthis_FE)

</div>
