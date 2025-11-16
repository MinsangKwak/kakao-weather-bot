// index.js

require('dotenv').config(); // .env 로딩

const express = require('express');
const bodyParser = require('body-parser');
const https = require('https');
const { URLSearchParams } = require('url');
const path = require('path');

const app = express();
app.use(bodyParser.json());

/* ------------------------------------------------------------
 * 1) 브라우저용: GET /
 *    - index.html 파일 전달
 * ------------------------------------------------------------ */
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

/* ------------------------------------------------------------
 * 2) 브라우저용: GET /weather?city=서울
 *    - JS에서 fetch로 호출
 * ------------------------------------------------------------ */
app.get('/weather', (req, res) => {
  const city = (req.query.city || '').trim();

  if (!city) {
    return res.status(400).json({ error: 'city 쿼리 파라미터가 필요합니다.' });
  }

  fetchOpenWeather(city, (err, text) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: '날씨 조회에 실패했습니다.' });
    }

    // 브라우저에서 쓰기 편하게 text를 그대로 내려줌
    return res.json({ text });
  });
});

/* ------------------------------------------------------------
 * 3) 카카오 스킬용: POST /kakao/weather
 *    - "/날씨 서울" 같은 발화 처리
 * ------------------------------------------------------------ */
app.post('/kakao/weather', (req, res) => {
  const utterance = req.body.userRequest?.utterance || '';
  const trimmed = utterance.trim();

  // "/날씨 판교" → "날씨 판교"
  const noSlash = trimmed.startsWith('/') ? trimmed.slice(1).trim() : trimmed;

  const [command, ...rest] = noSlash.split(/\s+/);
  const location = rest.join(' ').trim();

  if (command !== '날씨' || !location) {
    return res.json(makeKakaoText('사용법: /날씨 [지역명]\n예) /날씨 서울\n예) /날씨 판교\n예) /날씨 대전'));
  }

  fetchOpenWeather(location, (err, text) => {
    if (err) {
      console.error(err);
      return res.json(makeKakaoText('날씨 정보를 불러오는 데 실패했습니다. 잠시 후 다시 시도해 주세요.'));
    }

    return res.json(makeKakaoText(text));
  });
});

/* ------------------------------------------------------------
 * 공통: OpenWeatherMap API 호출 함수
 * ------------------------------------------------------------ */
function fetchOpenWeather(city, callback) {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    return callback(new Error('OPENWEATHER_API_KEY 환경변수가 없습니다.'));
  }

  // 1) 우선 사용자가 입력한 한글 그대로 검색 시도
  const primaryQuery = city;

  // 2) 기본 매핑(없어도 되지만 정확도 보정을 위해 남김)
  const cityMap = {
    // --- 안양시 (Anyang / 동안구 / 만안구) ---
    안양: 'Anyang-si,KR',
    안양시: 'Anyang-si,KR',
    동안구: 'Anyang-si,KR',
    만안구: 'Anyang-si,KR',

    // 역 기준
    안양역: 'Anyang-si,KR',
    명학역: 'Anyang-si,KR',
    범계역: 'Anyang-si,KR',
    평촌역: 'Anyang-si,KR',
    인덕원역: 'Anyang-si,KR',

    // --- 군포시 ---
    군포: 'Gunpo,KR',
    군포시: 'Gunpo,KR',

    // 군포·안양 경계역
    금정: 'Gunpo,KR',
    금정역: 'Gunpo,KR',
    산본: 'Gunpo,KR',
    산본역: 'Gunpo,KR',
    당정역: 'Gunpo,KR',

    // --- 의왕시 ---
    의왕: 'Uiwang,KR',
    의왕시: 'Uiwang,KR',
    의왕역: 'Uiwang,KR',

    // --- 과천 ---
    과천: 'Gwacheon,KR',
    과천시: 'Gwacheon,KR',
    정부과천청사역: 'Gwacheon,KR',
    과천정부청사역: 'Gwacheon,KR',

    // --- 여의도 (추가 예시) ---
    여의도: 'Yeouido,KR',
    여의도역: 'Yeouido,KR',
  };

  const fallbackQuery = cityMap[city] || ''; // 2차 검색용

  // OpenWeather 호출 함수
  function callAPI(query, cb) {
    const params = new URLSearchParams({
      q: query,
      appid: apiKey,
      units: 'metric',
      lang: 'kr',
    });

    const options = {
      host: 'api.openweathermap.org',
      path: '/data/2.5/weather?' + params.toString(),
      method: 'GET',
    };

    https
      .get(options, apiRes => {
        let data = '';

        apiRes.on('data', chunk => (data += chunk));
        apiRes.on('end', () => {
          try {
            const json = JSON.parse(data);
            if (json.cod && Number(json.cod) !== 200) {
              return cb(new Error(json.message || 'OpenWeather API error'));
            }
            cb(null, json);
          } catch (e) {
            cb(e);
          }
        });
      })
      .on('error', cb);
  }

  /* --------------------------------------------------------
   * 1차 시도: 사용자 입력 그대로 검색
   * -------------------------------------------------------- */
  callAPI(primaryQuery, (err, json) => {
    if (!err) {
      // 성공 → 바로 응답 구성
      const temp = json.main?.temp;
      const feels = json.main?.feels_like;
      const desc = json.weather?.[0]?.description;
      return callback(null, `🌤️ ${city}의 현재 기온은 ${temp}℃ (체감 ${feels}℃), 날씨는 '${desc}' 입니다.`);
    }

    // 2차 시도 자체도 없으면 끝
    if (!fallbackQuery) {
      return callback(new Error('검색 결과를 찾을 수 없습니다.'));
    }

    /* --------------------------------------------------------
     * 2차 시도: 매핑된 지역명으로 재조회
     * -------------------------------------------------------- */
    callAPI(fallbackQuery, (err2, json2) => {
      if (err2) return callback(new Error('검색 결과를 찾을 수 없습니다.'));

      const temp = json2.main?.temp;
      const feels = json2.main?.feels_like;
      const desc = json2.weather?.[0]?.description;
      return callback(null, `🌤️ ${city}의 현재 기온은 ${temp}℃ (체감 ${feels}℃), 날씨는 '${desc}' 입니다.`);
    });
  });
}

/* ------------------------------------------------------------
 * 공통: 카카오 응답 템플릿
 * ------------------------------------------------------------ */
function makeKakaoText(text) {
  return {
    version: '2.0',
    template: {
      outputs: [
        {
          simpleText: {
            text,
          },
        },
      ],
    },
  };
}

/* ------------------------------------------------------------
 * 서버 시작
 * ------------------------------------------------------------ */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Kakao weather server listening on port ${PORT}`);
});
