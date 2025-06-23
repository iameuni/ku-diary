import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import PageWrapper from "../components/PageWrapper";

const HomePage = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔥 Firebase 인증 상태 확인
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("🔐 홈페이지 인증 상태:", user ? "로그인됨" : "로그아웃됨");
      setCurrentUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 캐릭터 설정 확인 (로그인한 사용자만)
  useEffect(() => {
    if (!currentUser || loading) return;

    const userCharacter = localStorage.getItem("userCharacter");
    if (!userCharacter) {
      const showPrompt = window.confirm(
        "🎨 아직 나만의 캐릭터를 만들지 않으셨네요!\n\n" +
        "사진이나 텍스트로 나만의 웹툰 캐릭터를 만들어보시겠어요?"
      );
      if (showPrompt) {
        navigate("/character-setup");
      }
    }
  }, [navigate, currentUser, loading]);

  // 로딩 중
  if (loading) {
    return (
      <PageWrapper>
        <div style={{ 
          textAlign: "center", 
          padding: "100px 20px",
          fontSize: "18px",
          color: "#666"
        }}>
          <div style={{ fontSize: "48px", marginBottom: "20px" }}>🔄</div>
          <div>로딩 중...</div>
        </div>
      </PageWrapper>
    );
  }

  // 🔐 로그인하지 않은 사용자
  if (!currentUser) {
    return (
      <PageWrapper>
        <div style={{
          textAlign: "center",
          padding: "60px 20px",
          maxWidth: "500px",
          margin: "0 auto"
        }}>
          <div style={{ fontSize: "72px", marginBottom: "30px" }}>📝</div>
          
          <h1 style={{ 
            fontSize: "32px", 
            marginBottom: "20px",
            color: "#333"
          }}>
            감정 웹툰 다이어리
          </h1>
          
          <p style={{ 
            fontSize: "18px", 
            color: "#666", 
            marginBottom: "40px",
            lineHeight: "1.6"
          }}>
            오늘의 감정을 일기로 기록하고,<br/>
            AI가 만들어주는 웹툰으로 저장해보세요! 🎨
          </p>

          <div style={{
            display: "flex",
            gap: "15px",
            justifyContent: "center",
            flexWrap: "wrap",
            marginBottom: "40px"
          }}>
            <button
              onClick={() => navigate("/login")}
              style={{
                padding: "15px 30px",
                fontSize: "18px",
                backgroundColor: "#007bff",
                color: "#fff",
                border: "none",
                borderRadius: "12px",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(0, 123, 255, 0.3)",
                transition: "transform 0.2s"
              }}
              onMouseOver={(e) => e.target.style.transform = "translateY(-2px)"}
              onMouseOut={(e) => e.target.style.transform = "translateY(0)"}
            >
              🔑 로그인
            </button>
            
            <button
              onClick={() => navigate("/sign-up")}
              style={{
                padding: "15px 30px",
                fontSize: "18px",
                backgroundColor: "#28a745",
                color: "#fff",
                border: "none",
                borderRadius: "12px",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(40, 167, 69, 0.3)",
                transition: "transform 0.2s"
              }}
              onMouseOver={(e) => e.target.style.transform = "translateY(-2px)"}
              onMouseOut={(e) => e.target.style.transform = "translateY(0)"}
            >
              ✨ 회원가입
            </button>
          </div>

          <div style={{
            backgroundColor: "#f8f9fa",
            padding: "30px",
            borderRadius: "15px",
            border: "2px dashed #dee2e6"
          }}>
            <h3 style={{ 
              fontSize: "20px", 
              marginBottom: "20px",
              color: "#495057"
            }}>
              🌟 주요 기능
            </h3>
            
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "20px",
              textAlign: "left"
            }}>
              <FeatureCard 
                emoji="📝"
                title="감정 일기"
                description="AI가 당신의 감정을 분석해드려요"
              />
              <FeatureCard 
                emoji="🎨"
                title="나만의 캐릭터"
                description="웹툰 속 주인공을 직접 만드세요"
              />
              <FeatureCard 
                emoji="📚"
                title="웹툰 갤러리"
                description="매일의 기록을 웹툰으로 보관"
              />
              <FeatureCard 
                emoji="📊"
                title="감정 통계"
                description="나의 감정 패턴을 한눈에"
              />
            </div>
          </div>
        </div>
      </PageWrapper>
    );
  }

  // 🔓 로그인한 사용자 (기존 홈페이지)
  return (
    <PageWrapper>
      <div style={{
        textAlign: "center",
        padding: "20px",
        maxWidth: "600px",
        margin: "0 auto"
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px"
        }}>
          <h1 style={{ fontSize: "26px", margin: "0" }}>
            😊 오늘 한 컷
          </h1>
          <div style={{
            padding: "8px 15px",
            backgroundColor: "#e7f3ff",
            borderRadius: "20px",
            fontSize: "14px",
            color: "#0066cc"
          }}>
            👤 {currentUser.email}
          </div>
        </div>
        
        <p style={{ fontSize: "16px", color: "#555", marginBottom: "30px" }}>
          오늘의 감정을 기록하고, 나만의 캐릭터와 함께 웹툰으로 저장해보세요!
        </p>

        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "16px",
          justifyContent: "center",
          marginBottom: "30px"
        }}>
          <HomeCard
            emoji="📝"
            title="감정 기록하기"
            onClick={() => navigate("/input")}
          />
          <HomeCard
            emoji="📚"
            title="갤러리 보기"
            onClick={() => navigate("/gallery")}
          />
          <HomeCard
            emoji="📊"
            title="통계 확인"
            onClick={() => navigate("/stats")}
          />
          <HomeCard
            emoji="🎨"
            title="캐릭터 설정"
            onClick={() => navigate("/character-setup")}
          />
        </div>

        {/* 캐릭터 미리보기 섹션 */}
        <CharacterPreview />
      </div>
    </PageWrapper>
  );
};

const HomeCard = ({ emoji, title, onClick }) => (
  <div
    onClick={onClick}
    style={{
      flex: "1 0 40%",
      minWidth: "140px",
      padding: "13px",
      border: "1px solid #eee",
      borderRadius: "12px",
      backgroundColor: "#fff",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
      cursor: "pointer",
      textAlign: "center",
      transition: "transform 0.2s",
    }}
    onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
  >
    <div style={{ fontSize: "36px" }}>{emoji}</div>
    <div style={{ marginTop: "8px", fontWeight: "bold", fontSize: "16px" }}>
      {title}
    </div>
  </div>
);

const FeatureCard = ({ emoji, title, description }) => (
  <div style={{
    padding: "15px",
    backgroundColor: "white",
    borderRadius: "10px",
    textAlign: "center"
  }}>
    <div style={{ fontSize: "24px", marginBottom: "10px" }}>{emoji}</div>
    <h4 style={{ margin: "0 0 8px 0", fontSize: "16px", fontWeight: "bold" }}>
      {title}
    </h4>
    <p style={{ margin: "0", fontSize: "14px", color: "#666", lineHeight: "1.4" }}>
      {description}
    </p>
  </div>
);

// 캐릭터 미리보기 컴포넌트
const CharacterPreview = () => {
  const userCharacter = JSON.parse(localStorage.getItem("userCharacter") || "{}");
  
  if (!userCharacter.images) return null;

  return (
    <div style={{
      marginTop: "40px",
      padding: "20px",
      backgroundColor: "#f8f9fa",
      borderRadius: "12px",
      textAlign: "center"
    }}>
      <h3 style={{ marginBottom: "15px", fontSize: "18px" }}>
        🎭 내 캐릭터
      </h3>
      <div style={{
        display: "flex",
        gap: "10px",
        justifyContent: "center",
        flexWrap: "wrap"
      }}>
        {Object.entries(userCharacter.images).slice(0, 3).map(([emotion, url]) => (
          <div key={emotion} style={{
            backgroundColor: "white",
            padding: "10px",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }}>
            <img
              src={url}
              alt={emotion}
              style={{
                width: "80px",
                height: "80px",
                objectFit: "cover",
                borderRadius: "6px"
              }}
            />
            <p style={{ 
              margin: "5px 0 0 0", 
              fontSize: "12px",
              color: "#666"
            }}>
              {emotion}
            </p>
          </div>
        ))}
      </div>
      <p style={{
        marginTop: "10px",
        fontSize: "14px",
        color: "#666"
      }}>
        {userCharacter.method === "photo" ? "📸 사진으로 생성됨" : "✏️ 설명으로 생성됨"}
      </p>
    </div>
  );
};

export default HomePage;