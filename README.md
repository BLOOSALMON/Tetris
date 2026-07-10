# Tetris

Phaser 3 + React + TypeScript로 만든 웹 브라우저용 테트리스 클론. 공식 Tetris Guideline(SRS 회전, 7-bag 랜덤, 홀드, 고스트 피스)을 기반으로 한다. 자세한 기획은 [PRD-tetris.md](PRD-tetris.md) 참고.

## 기술 스택

- **언어**: TypeScript (strict)
- **빌드**: Vite
- **게임 렌더링/루프**: Phaser 3
- **비게임 UI**: React (타이틀, 일시정지, 게임오버 화면)
- **상태 관리**: Zustand
- **테스트**: Vitest

## 시작하기

```bash
npm install
npm run dev
```

`http://localhost:5173`에서 접속.

## 스크립트

| 명령어 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 타입 체크 후 프로덕션 빌드 |
| `npm run preview` | 빌드 결과 미리보기 |
| `npm test` | Vitest 단위 테스트 실행 |
| `npm run test:watch` | Vitest watch 모드 |
| `npm run lint` | ESLint 검사 |
| `npm run typecheck` | 타입 체크만 실행 |

## 조작법

| 키 | 동작 |
|---|---|
| ← / → | 좌우 이동 |
| ↓ | 소프트 드롭 |
| Space | 하드 드롭 |
| ↑ / X | 시계 방향 회전 |
| Z | 반시계 방향 회전 |
| C | 홀드 |
| Esc | 일시정지 |

## 폴더 구조

```
src/
  scenes/      # Phaser Scene (게임 화면)
  systems/     # 회전 판정, 라인 클리어, 7-bag, 점수 계산 등 순수 로직
  ui/          # React로 만든 타이틀/일시정지/게임오버 UI
  config/      # 보드 크기, 낙하 속도, 점수 등 밸런스 데이터
  store/       # Zustand 전역 상태
```

게임 규칙(로직)은 `systems/`에 렌더링과 분리된 순수 함수로 작성되어 Phaser 없이도 단위 테스트가 가능하다.

## 개발 가이드

코드 스타일, 폴더 구조, 개발 원칙(로직/렌더링 분리, 데이터 주도 설계 등)은 [CLAUDE.md](CLAUDE.md)에 정리되어 있다.
