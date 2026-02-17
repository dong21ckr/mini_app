export default async function handler(req, res) {
  // POST 요청만 허용
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Vercel 환경변수에서 봇 토큰 가져오기
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chat_id = process.env.CHAT_ID;
  const env_chat_id = process.env.CHAT_INIT_ID;

  if (!token) {
    return res.status(500).json({ error: 'Bot token not configured' });
  }

  // 클라이언트(미니 앱)에서 보낸 데이터 받기  
  const { chat_init_id, text } = req.body;

  // 로그 추가: 요청 데이터 확인 (Vercel Logs 탭에서 확인 가능)
  // console.log("요청 데이터:", { chat_id,chat_init_id, env_chat_id, text, tokenExists: !!token });


  // chat_init_id 검증: 환경변수에 설정된 chat_init_id와 비교
  if ( env_chat_id && chat_init_id !== Number(env_chat_id) ) {
    return res.status(403).json({ error: 'Unauthorized: chat_init_id does not match' });
  }
  
  
  try {
    // 텔레그램 API 호출 (메시지 보내기)
    const telegramUrl = `https://api.telegram.org/bot${token}/sendMessage`;
    
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: Number(chat_id), // 환경변수에서 가져온 chat_id 사용
        text: text,
        parse_mode: 'HTML' // HTML 태그 사용 가능
      }),
    });

    const data = await response.json();
    console.log("텔레그램 응답:", data); // 응답 결과 로그 남기기

    if (data.ok) {
      return res.status(200).json({ success: true, message: '전송 성공' });
    } else {
      return res.status(400).json({ success: false, error: data.description });
    }
  } catch (error) {
    console.error('Error sending message:', error);
    return res.status(500).json({ success: false, error: '서버 에러 발생' });
  }
}