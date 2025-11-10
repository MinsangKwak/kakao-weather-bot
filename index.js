// index.js
const express = require('express');
const bodyParser = require('body-parser');

const app = express();

// 카카오에서 JSON으로 보내기 때문에 필요
app.use(bodyParser.json());

// 카카오 스킬 콜백 URL (예: /kakao/weather)
app.post('/kakao/weather', (req, res) => {
  // 1) 사용자가 보낸 문장 가져오기
  const userUtterance = req.body.userRequest?.utterance || '';
  const trimmed = userUtterance.trim(); // 예: "/오늘날씨 서울"

  // 2) 맨 앞 슬래시만 제거해서 그대로 돌려주기
  const text = trimmed.startsWith('/') ? trimmed.slice(1) : trimmed || '입력이 없습니다.';

  // 3) 카카오 응답 형식으로 반환
  return res.json({
    version: '2.0',
    template: {
      outputs: [
        {
          simpleText: {
            text, // 예: "오늘날씨 서울"
          },
        },
      ],
    },
  });
});

// 서버 시작
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Kakao skill server listening on port ${PORT}`);
});
