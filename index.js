// index.js
const express = require('express');
const bodyParser = require('body-parser');
const https = require('https');
const { URLSearchParams } = require('url');

const app = express();
app.use(bodyParser.json());

// 🔹 카카오 스킬 엔드포인트
app.post('/kakao/weather', (req, res) => {
  const utterance = req.body.userRequest?.utterance || ''; // "/오늘날씨 서울"
  const trimmed = utterance.trim();

  // "/오늘날씨 서울" -> "오늘날씨 서울"
  const noSlash = trimmed.startsWith('/') ? trimmed.slice(1) : trimmed;
  const [command, cityRaw] = noSlash.split(' ');

  const city = cityRaw?.trim();

  if (command !== '오늘날씨' || !city) {
    return res.json(makeKakaoText('사용법: /오늘날씨 [도시명]\n예) /오늘날씨 서울'));
  }

  fetchOpenWeather(city, (err, text) => {
    if (err) {
      console.error(err);
      return res.json(makeKakaoText('날씨 정보를 불러오는 데 실패했습니다. 잠시 후 다시 시도해 주세요.'));
    }

    return res.json(makeKakaoText(text));
  });
});

// 🔹 OpenWeatherMap 호출 함수
function fetchOpenWeather(city, callback) {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    return callback(new Error('OPENWEATHER_API_KEY 환경변수가 없습니다.'));
  }

  // 한글 도시명 → OpenWeather용 도시명 간단 매핑
  const cityMap = {
    서울: 'Seoul,KR',
    부산: 'Busan,KR',
    대구: 'Daegu,KR',
    인천: 'Incheon,KR',
    광주: 'Gwangju,KR',
    대전: 'Daejeon,KR',
    울산: 'Ulsan,KR',
    수원: 'Suwon,KR',
  };

  const queryCity = cityMap[city] || city; // 매핑 없으면 그냥 city 그대로 사용

  const params = new URLSearchParams({
    q: queryCity,
    appid: apiKey,
    units: 'metric', // 섭씨
    lang: 'kr', // 한국어 설명
  });

  const options = {
    host: 'api.openweathermap.org',
    path: '/data/2.5/weather?' + params.toString(),
    method: 'GET',
  };

  https
    .get(options, apiRes => {
      let data = '';

      apiRes.on('data', chunk => {
        data += chunk;
      });

      apiRes.on('end', () => {
        try {
          const json = JSON.parse(data);

          if (json.cod && Number(json.cod) !== 200) {
            return callback(new Error(json.message || 'OpenWeather API error'));
          }

          const temp = json.main?.temp;
          const desc = json.weather?.[0]?.description;

          const text = `🌤️ ${city}의 현재 기온은 ${temp}℃, 날씨는 ${desc}입니다.`;
          callback(null, text);
        } catch (e) {
          callback(e);
        }
      });
    })
    .on('error', err => {
      callback(err);
    });
}

// 🔹 카카오 응답 포맷 헬퍼
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

// 🔹 서버 시작
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Kakao skill server listening on port ${PORT}`);
});
