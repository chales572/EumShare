# Vercel 배포 가이드

## 1. Vercel CLI 설치

```bash
npm install -g vercel
```

## 2. Vercel 로그인

```bash
vercel login
```

## 3. 서버 디렉토리로 이동

```bash
cd server
```

## 4. Vercel 배포

### 테스트 배포 (Development)
```bash
vercel
```

### 프로덕션 배포
```bash
vercel --prod
```

## 5. 환경 변수 설정

배포 후 Vercel 대시보드에서 환경 변수를 설정해야 합니다:

1. https://vercel.com/dashboard 접속
2. 프로젝트 선택
3. Settings > Environment Variables 이동
4. 다음 환경 변수 추가:

```
PORT=3001
HOST=0.0.0.0
ALLOWED_ORIGINS=https://your-client-domain.com,https://localhost:3000
NODE_ENV=production
```

또는 CLI로 설정:
```bash
vercel env add PORT
vercel env add HOST
vercel env add ALLOWED_ORIGINS
vercel env add NODE_ENV
```

## 6. 재배포

환경 변수 설정 후 재배포:
```bash
vercel --prod
```

## 7. 배포 URL 확인

배포가 완료되면 Vercel이 제공하는 URL을 확인할 수 있습니다:
- 예: `https://your-project.vercel.app`

## 8. 클라이언트 연결

클라이언트 코드에서 서버 URL을 Vercel URL로 변경:
```javascript
const SOCKET_SERVER = 'https://your-project.vercel.app';
```

## 주의사항

### WebSocket 제한
⚠️ **중요**: Vercel의 Serverless Functions는 **WebSocket을 완전히 지원하지 않습니다**.

Socket.IO는 HTTP 롱 폴링으로 fallback되지만, 성능이 제한될 수 있습니다.

### 권장 대안
실시간 WebSocket이 필요한 경우 다음 플랫폼 사용을 권장합니다:

1. **Railway** (https://railway.app)
   - WebSocket 완전 지원
   - 간단한 배포
   - 무료 티어 제공

2. **Render** (https://render.com)
   - WebSocket 완전 지원
   - 무료 티어 제공

3. **Heroku** (https://heroku.com)
   - WebSocket 완전 지원
   - 유료 플랜

## Railway 배포 (권장)

Railway는 WebSocket을 완전 지원하며 배포가 간단합니다:

```bash
# Railway CLI 설치
npm install -g @railway/cli

# 로그인
railway login

# 프로젝트 초기화
cd server
railway init

# 배포
railway up
```

## 문제 해결

### Socket.IO 연결 실패
- ALLOWED_ORIGINS에 클라이언트 도메인이 포함되어 있는지 확인
- Vercel 대시보드에서 환경 변수가 제대로 설정되었는지 확인

### 타임아웃 에러
- Vercel Serverless Functions는 10초 제한이 있습니다
- WebSocket 장시간 연결이 필요하면 Railway/Render 사용

## 도움말

Vercel 공식 문서: https://vercel.com/docs
Railway 공식 문서: https://docs.railway.app
