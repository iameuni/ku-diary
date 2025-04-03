import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageWrapper from "../components/PageWrapper";

const EmotionInput = () => {
  const [text, setText] = useState("");
  const navigate = useNavigate();

  const isValid = text.trim().length >= 10;
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleAnalyze = () => {
    if (!isValid) {
      alert("✏️ 일기 내용을 10자 이상 입력해주세요.");
      return;
    }

    navigate("/result", { state: { inputText: text } });
  };

  return (
    <PageWrapper>
      <div
        style={{
          maxWidth: "600px",
          margin: "0 auto",
          fontFamily: "'Apple SD Gothic Neo', sans-serif",
        }}
      >
        <h1
          style={{
            fontSize: "26px",
            marginBottom: "10px",
            textAlign: "center",
          }}
        >
          ✏️ 오늘의 이야기
        </h1>
        <p
          style={{
            fontSize: "14px",
            textAlign: "center",
            color: "#666",
            marginBottom: "40px",
          }}
        >
          오늘 있었던 일이나 감정을 솔직하게 기록해보세요!
        </p>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="예: 오늘 발표를 망쳐서 너무 속상했어..."
          rows={15}
          style={{
            width: "100%",
            padding: isMobile ? "18px" : "15px",
            fontSize: isMobile ? "17px" : "16px",
            border: "1px solid #ccc",
            borderRadius: "10px",
            resize: "none",
            boxSizing: "border-box",
          }}
        />

        {!isValid && (
          <p style={{ fontSize: "12px", color: "#888", marginTop: "30px" }}>
            ⛔ 10자 이상 입력해 주세요
          </p>
        )}

        <button
          onClick={handleAnalyze}
          disabled={!isValid}
          style={{
            width: "100%",
            padding: "12px",
            fontSize: "16px",
            backgroundColor: isValid ? "#007bff" : "#ccc",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: isValid ? "pointer" : "not-allowed",
            transition: "background-color 0.2s ease",
          }}
        >
          🚀 감정 분석 시작
        </button>
      </div>
    </PageWrapper>
  );
};

export default EmotionInput;
