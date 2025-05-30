import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import PageWrapper from "../components/PageWrapper";

const HomePage = () => {
  const navigate = useNavigate();

  // 캐릭터 설정 확인
  useEffect(() => {
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
  }, [navigate]);

  return (
    <PageWrapper>
      <h1
        style={{ fontSize: "26px", textAlign: "center", marginBottom: "10px" }}
      >
        😊 오늘 한 컷
      </h1>
      <p style={{ fontSize: "16px", color: "#555", textAlign: "center" }}>
        오늘의 감정을 기록하고, 나만의 캐릭터와 함께 웹툰으로 저장해보세요!
      </p>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "16px",
          justifyContent: "center",
          marginTop: "30px",
        }}
      >
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

      {/* 캐릭터 미리보기 섹션 추가 */}
      <CharacterPreview />
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

// 캐릭터 미리보기 컴포넌트 추가
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