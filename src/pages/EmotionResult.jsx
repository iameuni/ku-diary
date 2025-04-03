import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import PageWrapper from "../components/PageWrapper";

const EmotionResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const inputText = location.state?.inputText || "";

  const [emotion, setEmotion] = useState("");
  const [summary, setSummary] = useState("");

  const emotionList = ["기쁨 😊", "슬픔 😢", "분노 😡", "불안 😰", "중립 😐"];

  useEffect(() => {
    if (!inputText) return;

    const randomEmotion =
      emotionList[Math.floor(Math.random() * emotionList.length)];
    setEmotion(randomEmotion);

    const trimmed = inputText.trim();
    const summaryText =
      trimmed.length > 30 ? trimmed.slice(0, 30) + "..." : trimmed;
    setSummary(summaryText);
  }, [inputText]);

  const handleGoToWebtoon = () => {
    navigate("/webtoon", {
      state: {
        inputText,
        emotion,
        summary,
      },
    });
  };

  if (!inputText) {
    return (
      <PageWrapper>
        <p style={{ textAlign: "center", marginTop: "100px", color: "#888" }}>
          ⚠️ 일기 내용이 없습니다. <br />{" "}
          <a href="/input">/input 페이지에서 작성해 주세요.</a>
        </p>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div
        style={{
          maxWidth: "600px",
          margin: "0 auto",
          textAlign: "center",
          fontFamily: "'Apple SD Gothic Neo', sans-serif",
        }}
      >
        <h1 style={{ fontSize: "26px", marginBottom: "10px" }}>
          🔍 감정 분석 결과
        </h1>
        <p style={{ fontSize: "16px", color: "#666" }}>
          아래 결과를 바탕으로 웹툰을 생성할게요!
        </p>

        <div
          style={{
            margin: "30px 0",
            padding: "20px",
            backgroundColor: "#fefefe",
            border: "1px solid #ddd",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.03)",
          }}
        >
          <p style={{ fontSize: "18px", marginBottom: "10px" }}>
            <strong>{emotion}</strong>
          </p>
          <p style={{ fontStyle: "italic", color: "#555" }}>“{summary}”</p>
        </div>

        <button
          onClick={handleGoToWebtoon}
          style={{
            width: "100%",
            padding: "14px",
            fontSize: "16px",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            transition: "background-color 0.2s ease",
          }}
        >
          🖼️ 웹툰 생성하기
        </button>
      </div>
    </PageWrapper>
  );
};

export default EmotionResult;
