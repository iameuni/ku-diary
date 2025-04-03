import { useNavigate } from "react-router-dom";
import PageWrapper from "../components/PageWrapper";

const HomePage = () => {
  const navigate = useNavigate();

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
          title="커스터마이징"
          onClick={() => navigate("/custom")}
        />
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

export default HomePage;
