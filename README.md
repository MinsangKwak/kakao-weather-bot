# ☀️ Kakao Weather Bot — 카카오톡 & 웹 기반 날씨 조회 서버

Node.js 기반으로 동작하는 **카카오톡 챗봇 + 웹 테스트 페이지 겸용 날씨 서버**입니다.
카카오톡에서 `/날씨 서울`, `/날씨 안양역`, `/날씨 금정`, `/날씨 대전` 같은 명령어를 입력하면
OpenWeatherMap API를 통해 실시간 날씨를 조회해 응답합니다.

브라우저에서는 `/weather?city=서울` 또는 **prompt 입력**으로 바로 테스트할 수 있습니다.

---

# 🚀 1. 프로젝트 특징 (What’s New?)

### ✅ **1) 브라우저/웹에서 바로 테스트 가능**

-   `index.html` 제공
-   로딩 시 prompt()로 지역명을 받아 날씨 출력
-   `/weather?city=지역명` GET API 제공

### ✅ **2) 카카오톡 명령어 지원**

-   `/날씨 서울`
-   `/날씨 판교`
-   `/날씨 안양역`
-   `/날씨 금정`

### ✅ **3) 전국 지역명 + 지하철역 기반 매핑 지원**

-   안양, 안양역, 범계역, 평촌역, 금정역, 명학역
-   군포, 산본, 산본역, 당정역
-   의왕, 의왕역
-   과천, 정부과천청사역
-   여의도, 여의도역

### ✅ **4) 검색 실패 대비 2단계 보정 로직 적용**

1. 입력값 그대로 OpenWeather 검색
2. 실패 시 지역 매핑 기반 fallback 검색

### ✅ **5) .env 기반 환경변수 적용 (dotenv)**

---

# 🧩 2. 기술 스택

-   Node.js
-   Express.js
-   dotenv
-   OpenWeatherMap API
-   Kakao i 오픈빌더

---

# 📂 3. 폴더 구조

```
kakao-weather-bot/
├── index.js
├── index.html
├── package.json
├── .env
├── .gitignore
└── README.md
```

---

# ⚙️ 4. 설치 및 실행

## 1️⃣ 패키지 설치

```
npm install
```

## 2️⃣ 환경변수 설정 (.env)

```
OPENWEATHER_API_KEY=여기_API키
```

## 3️⃣ 서버 실행

```
node index.js
```

---

# 🌐 5. 브라우저 테스트

1. 브라우저에서 `http://localhost:3000` 열기
2. prompt 창에서 지역 입력
3. 즉시 날씨 표시

---

# 🤖 6. 카카오톡 챗봇 테스트

### 1️⃣ 스킬 서버 URL

```
http://YOUR_SERVER/kakao/weather
```

### 2️⃣ 사용 명령어

```
/날씨 서울
/날씨 안양
/날씨 금정역
/날씨 범계역
```

---

# 📍 7. 주요 지역/역 매핑 예시

| 입력값         | 조회 지역 |
| -------------- | --------- |
| 안양           | Anyang-si |
| 안양역         | Anyang-si |
| 범계역         | Anyang-si |
| 금정역         | Gunpo     |
| 산본역         | Gunpo     |
| 의왕역         | Uiwang    |
| 과천           | Gwacheon  |
| 정부과천청사역 | Gwacheon  |

---

# 📌 8. API 예시

### 요청

```
GET /weather?city=서울
```

### 응답

```json
{
    "text": "🌤️ 서울의 현재 기온은 16℃ (체감 14℃), 날씨는 '맑음'입니다."
}
```

---

# 🛠 9. 향후 확장

-   `/미세먼지 서울`
-   `/주간날씨 서울`
-   기상청(KMA) 연동
-   전국 지하철역 자동 크롤링

---

# ✨ License

MIT License
