# Railway 배포 가이드 (추천)

Railway는 WebSocket을 완전히 지원하므로 Socket.IO 기반 서버에 최적입니다!

## 방법 1: Railway Web 대시보드 (가장 쉬움) ⭐

### 1. Railway 계정 생성
1. https://railway.app 접속
2. GitHub 계정으로 로그인

### 2. GitHub 저장소 연결
1. "New Project" 클릭
2. "Deploy from GitHub repo" 선택
3. `chales572/EumShare` 저장소 선택
4. **Root Directory를 `server`로 설정**

### 3. 환경 변수 설정
"Variables" 탭에서 다음 환경 변수 추가:

```
PORT=3001
HOST=0.0.0.0
ALLOWED_ORIGINS=https://your-client-domain.com
NODE_ENV=production
```

**중요**: `ALLOWED_ORIGINS`에 클라이언트 도메인을 반드시 추가하세요!

### 4. 배포 확인
- Railway가 자동으로 빌드 및 배포를 시작합니다
- "Deployments" 탭에서 진행 상황 확인
- 배포 완료 후 도메인이 생성됩니다 (예: `your-app.up.railway.app`)

### 5. 도메인 복사
- "Settings" > "Networking" 에서 public URL 확인
- 예: `https://sharepdf-server-production.up.railway.app`

---

## 방법 2: Railway CLI (고급)

### 1. Railway CLI 설치

```bash
npm install -g @railway/cli
```

### 2. Railway 로그인

```bash
railway login
```

브라우저가 열리면 GitHub 계정으로 인증합니다.

### 3. 프로젝트 초기화

```bash
cd server
railway init
```

프롬프트에 따라:
- Project name 입력 (예: `sharepdf-server`)
- 새 프로젝트 생성 선택

### 4. 환경 변수 설정

```bash
railway variables set PORT=3001
railway variables set HOST=0.0.0.0
railway variables set NODE_ENV=production
railway variables set ALLOWED_ORIGINS=https://your-client-domain.com
```

### 5. 배포

```bash
railway up
```

### 6. 로그 확인

```bash
railway logs
```

### 7. 도메인 생성

```bash
railway domain
```

---

## 배포 후 확인사항

### 1. 서버 상태 확인
Railway 대시보드에서 "Logs" 탭을 확인하여 다음 메시지가 나오는지 확인:

```
Signaling server running on 0.0.0.0:3001
Environment: production
Allowed origins: https://your-client-domain.com
```

### 2. 서버 URL 테스트
브라우저에서 Railway 도메인에 접속:
- `https://your-app.up.railway.app`
- 연결되면 기본 Express 화면이 보입니다

### 3. WebSocket 연결 테스트
개발자 도구 콘솔에서:

```javascript
const socket = io('https://your-app.up.railway.app');
socket.on('connect', () => console.log('Connected!'));
```

---

## 클라이언트 설정 업데이트

배포 완료 후 클라이언트 코드에서 서버 URL을 변경하세요:

### client/src/config.js (또는 해당 파일)
```javascript
export const SOCKET_SERVER = process.env.NODE_ENV === 'production'
  ? 'https://your-app.up.railway.app'
  : 'http://localhost:3001';
```

또는 환경 변수 사용:
```javascript
export const SOCKET_SERVER = process.env.REACT_APP_SOCKET_SERVER || 'http://localhost:3001';
```

---

## 자동 배포 설정

Railway는 GitHub에 푸시하면 자동으로 재배포됩니다:

1. 코드 수정
2. Git commit & push
3. Railway가 자동으로 감지하고 배포

```bash
git add .
git commit -m "Update server code"
git push origin main
```

---

## 비용 정보

Railway 무료 티어:
- **$5 크레딧/월** (신용카드 등록 필요)
- 약 **500시간 실행 가능**
- WebSocket 완전 지원
- 자동 SSL/HTTPS
- 무제한 배포

유료 플랜: $5/월부터 (더 많은 크레딧)

---

## 문제 해결

### 502 Bad Gateway
- 서버가 제대로 시작되었는지 로그 확인
- `PORT` 환경 변수가 설정되어 있는지 확인
- Railway는 자동으로 PORT를 할당하므로 코드가 `process.env.PORT`를 사용하는지 확인

### CORS 에러
- `ALLOWED_ORIGINS`에 클라이언트 도메인이 정확히 포함되어 있는지 확인
- 프로토콜(https://)과 포트까지 정확히 입력

### WebSocket 연결 실패
- 클라이언트에서 `https://` (WSS) 프로토콜 사용
- CORS 설정 확인
- Railway 로그에서 연결 시도가 보이는지 확인

### 환경 변수 적용 안됨
- Variables 설정 후 재배포 필요
- CLI: `railway up --force`
- 또는 대시보드에서 "Redeploy"

---

## 유용한 명령어

```bash
# 프로젝트 상태 확인
railway status

# 로그 실시간 확인
railway logs --follow

# 환경 변수 확인
railway variables

# 프로젝트 열기 (대시보드)
railway open

# 로컬에서 Railway 환경으로 실행
railway run npm start

# 배포 롤백
railway rollback
```

---

## 다음 단계

1. ✅ Railway에 서버 배포
2. ⬜ 클라이언트 코드에서 서버 URL 업데이트
3. ⬜ 클라이언트도 배포 (Vercel, Netlify 등)
4. ⬜ 커스텀 도메인 연결 (선택)

---

## 도움말

- Railway 공식 문서: https://docs.railway.app
- Railway 디스코드: https://discord.gg/railway
- Railway 상태 페이지: https://status.railway.app

## 빠른 시작 (요약)

```bash
# 1. CLI 설치
npm install -g @railway/cli

# 2. 로그인
railway login

# 3. 서버 디렉토리로 이동
cd server

# 4. 프로젝트 초기화
railway init

# 5. 환경 변수 설정
railway variables set ALLOWED_ORIGINS=https://your-domain.com

# 6. 배포
railway up

# 7. 도메인 확인
railway domain
```

배포 완료! 🚀
