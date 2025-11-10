# ☀️ Kakao Weather Bot

카카오톡 챗봇에서 `/오늘날씨 서울` 명령을 입력하면
서울의 오늘 날씨 정보를 알려주는 간단한 Node.js 서버입니다.

---

## 🚀 1. 프로젝트 개요

이 프로젝트는 카카오 i 오픈빌더와 연동할 수 있는 **스킬 서버**입니다.
카카오톡에서 특정 명령어(`/오늘날씨 서울`)를 입력하면,
서버가 JSON 형식으로 응답하여 챗봇이 해당 내용을 사용자에게 전달합니다.

---

## 🧩 2. 기술 스택

-   Node.js
-   Express.js
-   Body-Parser
-   (추가 예정) OpenWeatherMap API

---

## 📂 3. 폴더 구조

```
kakao-weather-bot/
├── node_modules/ # 패키지 의존성
├── index.js # 서버 코드
├── package.json # 프로젝트 설정
├── .gitignore # node_modules 제외
└── README.md # 문서 파일
```

## ⚙️ 4. 설치 및 실행 방법

### 1️⃣ 의존성 설치

```bash
npm install
```

---

## 🌤️ 5. 날씨 API 연동 (OpenWeatherMap)

실제 날씨 데이터를 불러오기 위해 [OpenWeatherMap](https://openweathermap.org/api)에서 API 키를 발급받습니다.

### 1️⃣ 회원가입 및 키 발급

1. [https://openweathermap.org](https://openweathermap.org) 접속
2. 무료 회원가입 후 로그인
3. 상단 메뉴 → **My API keys** → **Generate Key** 클릭
4. 발급받은 키를 복사해둡니다. (예: `abc123def456...`)

---

### 2️⃣ 환경 변수(.env) 파일 생성

프로젝트 루트에 `.env` 파일을 새로 만들고, 아래처럼 작성합니다.

```bash
OPENWEATHER_API_KEY=여기에_본인_API_키_입력
```
