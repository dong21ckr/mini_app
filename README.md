# 🚀 Telegram Mini App Template (Vercel Backend)

이 프로젝트는 **Vercel**을 사용하여 텔레그램 미니 앱을 안전하게 배포하고, **봇 토큰을 환경 변수로 보호**하는 기능을 포함하고 있습니다.

## 📂 프로젝트 구조
```text
├── index.html       # 프론트엔드 (사용자 UI & 텔레그램 SDK)
├── package.json     # 프로젝트 설정 (ESM 모드 활성화)
└── api/
    └── bot.js       # 백엔드 (Telegram API 전송용 서버리스 함수)
```
## 🛠️ 핵심 소스 코드
# 1. index.html
사용자에게 보여지는 메인 화면입니다. 텔레그램 테마와 햅틱 피드백이 적용되었습니다.
```js
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Telegram Mini App</title>
    <link rel="icon" href="data:;base64,iVBORw0KGgo=">
    <script src="https://telegram.org"></script>
    <script>
        async function handleAction(name) {
            const tg = window.Telegram.WebApp;
            if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('medium');

            const showAlert = (msg) => {
                if (tg.isVersionAtLeast('6.2')) tg.showAlert(msg);
                else alert(msg);
            };

            try {
                const response = await fetch('/api/bot', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: tg.initDataUnsafe?.user?.id,
                        text: `<b>[${name}]</b> 메뉴 클릭 성공! 🚀`
                    })
                });
                const result = await response.json();
                if (result.success) showAlert(`${name} 완료!`);
                else showAlert("전송 실패: " + result.error);
            } catch (e) {
                showAlert("서버 연결 실패");
            }
        }
        window.onload = () => {
            const tg = window.Telegram.WebApp;
            tg.ready();
            tg.expand();
        };
    </script>
    <style>
        body { background-color: var(--tg-theme-secondary-bg-color, #f0f0f0); color: var(--tg-theme-text-color, #222); font-family: sans-serif; display: flex; flex-direction: column; align-items: center; padding: 20px; }
        .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; width: 100%; max-width: 400px; margin-top: 20px; }
        .btn { background-color: var(--tg-theme-bg-color, #fff); color: var(--tg-theme-button-color, #248bcf); border: 1px solid var(--tg-theme-hint-color, #ccc); border-radius: 12px; padding: 25px 10px; font-weight: bold; cursor: pointer; height: 100px; }
    </style>
</head>
<body>
    <h2>서비스 메뉴</h2>
    <div class="grid">
        <button class="btn" onclick="handleAction('프로필')">👤 프로필</button>
        <button class="btn" onclick="handleAction('랭킹')">🏆 랭킹</button>
        <button class="btn" onclick="handleAction('상점')">🛒 상점</button>
        <button class="btn" onclick="handleAction('설정')">⚙️ 설정</button>
    </div>
</body>
</html>
```
# 2. api/bot.js
봇 토큰을 안전하게 사용하여 텔레그램 서버로 메시지를 보냅니다.
```js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const { chat_id, text } = req.body;

  try {
    const response = await fetch(`https://api.telegram.org{token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id, text, parse_mode: 'HTML' }),
    });
    const data = await response.json();
    if (data.ok) return res.status(200).json({ success: true });
    return res.status(400).json({ success: false, error: data.description });
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }
}
```
# 3. package.json
```json
{
  "name": "telegram-mini-app",
  "version": "1.0.0",
  "type": "module"
}
```
# 4.🚀 배포 절차
위 파일들을 GitHub 저장소에 푸시합니다.
Vercel 대시보드에서 프로젝트를 연결합니다.
Settings > Environment Variables에 TELEGRAM_BOT_TOKEN을 추가합니다.
@BotFather에게 미니 앱 URL을 등록합니다


# 기타 참고 
```
1. 텔레그램 웹(Web) 버전 활용 (가장 간편)
봇을 추가하기 번거롭다면 텔레그램 웹(web.telegram.org)에 접속해 주소창의 URL을 확인하세요. 
개인 채팅/그룹: 채팅방을 클릭하면 브라우저 주소창이 https://web.telegram.org 형태가 됩니다. 이때 # 뒤의 숫자가 바로 해당 채팅방의 ID입니다.
주의: 그룹이나 채널의 경우 숫자 앞에 -100을 붙여야 하는 경우가 많습니다 (예: 123456789 -> -100123456789). 

2. 봇 API 'getUpdates' 활용 (개발자용)
본인이 만든 봇의 토큰이 있다면, 브라우저 주소창에 아래 주소를 입력하여 실시간 메시지 로그(JSON)에서 ID를 추출할 수 있습니다.
주소: https://api.telegram.org/bot{본인의_봇_토큰}/getUpdates.
방법: 위 페이지를 띄운 상태에서 해당 봇에게 아무 메시지나 보낸 후 페이지를 새로고침하세요. result 항목 안의 "chat": {"id": -100xxxxxx} 부분에서 ID를 확인할 수 있습니다. 
``` 

