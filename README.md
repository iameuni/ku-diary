🎨 KU-Diary: AI 감정 일기 웹툰 프로젝트

하루의 감정을 기록하고 AI가 생성한 웹툰으로 추억을 만들어보세요!

📖 프로젝트 소개
KU-Diary는 사용자의 일기를 분석하여 감정을 파악하고, AI가 생성한 캐릭터로 웹툰을 만들어주는 서비스입니다.
주요 기능

🎭 AI 캐릭터 생성: 사용자 설명을 바탕으로 5가지 감정 표현 캐릭터 생성
📝 감정 분석: 한국어 감정 분석 AI (KoBERT) 활용
🎨 웹툰 생성: GPT-4와 DALL-E 3를 이용한 자동 웹툰 생성
📊 감정 통계: 일별/주별 감정 변화 추적
🖼️ 갤러리: 생성된 웹툰 모아보기

🚀 시작하기
필수 요구사항

Python 3.10+
Node.js 14+
OpenAI API Key

설치 및 실행
1. 프로젝트 클론
bashgit clone https://github.com/iameuni/ku-diary.git
cd ku-diary
2. Backend 설정
bash# backend 폴더로 이동
cd backend

# 가상환경 생성 및 활성화
python -m venv venv

# Windows
.\venv\Scripts\Activate

# Mac/Linux
source venv/bin/activate

# pip 업그레이드
python -m pip install --upgrade pip

# 패키지 설치
pip install -r requirements.txt
3. 환경변수 설정
.env.example을 복사하여 .env 파일 생성:
bashcp .env.example .env
.env 파일을 열어 OpenAI API 키 입력:
OPENAI_API_KEY=sk-your-api-key-here
4. Backend 실행
bashpython run.py
⚠️ 첫 실행 시 주의사항:

AI 모델 자동 다운로드 (약 500MB)
다운로드 시간: 약 1-2분
model_cache 폴더가 자동 생성됨

5. Frontend 설정 및 실행
새 터미널을 열고:
bash# frontend 폴더로 이동
cd frontend

# 패키지 설치
npm install

# 실행
npm start
브라우저에서 http://localhost:3000 접속
📁 프로젝트 구조
ku-diary/
├── backend/
│   ├── app/
│   │   ├── routes/         # API 엔드포인트
│   │   ├── services/       # 비즈니스 로직
│   │   └── __init__.py
│   ├── venv/              # 가상환경 (git 제외)
│   ├── model_cache/       # AI 모델 캐시 (git 제외)
│   ├── .env               # 환경변수 (git 제외)
│   ├── .env.example       # 환경변수 예시
│   ├── requirements.txt   # Python 패키지 목록
│   └── run.py            # 서버 실행 파일
│
└── frontend/
    ├── src/
    │   ├── pages/         # 페이지 컴포넌트
    │   ├── components/    # 재사용 컴포넌트
    │   └── App.js        # 메인 앱
    ├── public/
    ├── package.json
    └── node_modules/     # npm 패키지 (git 제외)
🛠️ 개발 가이드
Git 브랜치 전략

main: 안정적인 배포 버전
develop: 개발 통합 브랜치
feature/*: 기능 개발 브랜치

코드 기여하기

이슈 생성 또는 할당받기
feature/기능명 브랜치 생성
코드 작성 및 테스트
Pull Request 생성
코드 리뷰 후 머지

API 엔드포인트
MethodEndpointDescriptionPOST/api/character/generate캐릭터 생성POST/api/emotion/analyze감정 분석POST/api/gpt/story스토리 생성POST/api/image/generate이미지 생성
🐛 문제 해결
Backend 관련
Q: 모델 다운로드가 안 돼요
bash# 캐시 삭제 후 재시작
rm -rf backend/model_cache
python run.py
Q: OpenAI API 에러가 나요

.env 파일의 API 키 확인
API 키 앞뒤 공백 제거
OpenAI 크레딧 잔액 확인

Frontend 관련
Q: npm install 에러
bash# 캐시 삭제 후 재설치
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
Q: 페이지가 안 보여요

Console 에러 확인 (F12)
Backend 서버 실행 여부 확인
CORS 설정 확인

📝 환경변수 설명
Backend (.env)
bash# OpenAI API 설정
OPENAI_API_KEY=sk-...  # 필수: OpenAI API 키

# 서버 설정 (선택)
FLASK_ENV=development   # 개발 모드
FLASK_DEBUG=True       # 디버그 모드
PORT=5000              # 서버 포트