## 과제 전시 웹앱 (정적)

설치 없이 **정적 HTML/CSS/JS**로 만든 “교수님께 보여드리는 과제 전시” 웹앱입니다.

### 실행

- **가장 쉬운 방법**: `index.html`을 더블클릭해서 브라우저로 열기

### 수정 포인트

- **메인 랜딩(인터랙션)**: `index.html` / `landing.js` / `styles-landing.css`
- **과제 전시(8장 뷰어 + 시공간 궤도 내비)**: `gallery.html` / `gallery.js` / `styles-gallery.css`
- **과제 이미지 8장**: `assets/pages/page-01.svg` ~ `page-08.svg` (스캔/사진으로 덮어쓰기)
- **OG/파비콘**: `assets/og.svg`, `assets/favicon.svg` 교체

### 배포(예: GitHub Pages)

1. 이 폴더를 GitHub 리포지토리로 올립니다.
2. GitHub → Settings → Pages
3. Source를 `Deploy from a branch`로 선택 후 `main` / `root` 지정

### 추가 요청 환영

- 디자인 톤 변경(미니멀/화이트/다크 고정 등)
- 8장 전시를 “공간×시간” 컨셉으로 더 강화(예: 페이지별 좌표/잔상/사운드)
- 모바일 제스처 개선(관성/스냅/햅틱)


