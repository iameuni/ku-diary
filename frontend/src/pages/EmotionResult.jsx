import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PageWrapper from "../components/PageWrapper";

const EmotionResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const inputText = location.state?.inputText || "";

  const [emotion, setEmotion] = useState("");
  const [emoji, setEmoji] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false); // 웹툰 생성 중 상태 추가

  const emotionEmojiMap = {
    기쁨: "😄",
    슬픔: "😢",
    분노: "😠",
    불안: "😨",
    중립: "😐",
  };

  useEffect(() => {
    if (!inputText) {
      navigate("/input");
      return;
    }

    const fetchEmotionAndSummary = async () => {
      try {
        // 1. 감정 분석
        const resEmotion = await fetch("/api/emotion", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: inputText }),
        });
        const emotionData = await resEmotion.json();
        setEmotion(emotionData.emotion);
        setEmoji(emotionEmojiMap[emotionData.emotion] || "❓");

        // 2. 텍스트 요약
        const resSummary = await fetch("/api/summarize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: inputText }),
        });
        const summaryData = await resSummary.json();
        setSummary(summaryData.summary);

        setLoading(false);
      } catch (error) {
        console.error("API 호출 오류:", error);
        setLoading(false);
      }
    };

    fetchEmotionAndSummary();
  }, [inputText, navigate]);

  const handleGenerateWebtoon = async () => {
    setGenerating(true);
    
    try {
      // 3. 웹툰 생성 (버튼 클릭 시에만)
      console.log("=== 웹툰 생성 시작 ===");
      console.log("inputText:", inputText);
      console.log("emotion:", emotion);
      console.log("summary:", summary);

      const resCuts = await fetch("/api/generate_4cuts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText, emotion: emotion }),
      });

      if (!resCuts.ok) {
        console.error("❌ GPT 호출 실패", resCuts.status);
        alert("웹툰 생성에 실패했습니다. 다시 시도해주세요.");
        setGenerating(false);
        return;
      }

      const cutsData = await resCuts.json();

      if (cutsData.error) {
        console.error("❌ GPT 응답 에러:", cutsData.error);
        alert("웹툰 생성 중 오류가 발생했습니다: " + cutsData.error);
        setGenerating(false);
        return;
      }

      console.log("✅ GPT 결과:", cutsData);
      console.log("📦 응답 키:", Object.keys(cutsData));
      
      // 웹툰 페이지로 이동
      navigate("/webtoon", {
        state: {
          inputText,
          emotion,
          summary,
          cuts: cutsData,
        },
      });
    } catch (error) {
      console.error("웹툰 생성 오류:", error);
      alert("웹툰 생성 중 오류가 발생했습니다.");
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <PageWrapper>
        <div style={{ textAlign: "center", marginTop: "100px" }}>
          <div style={{ fontSize: "24px" }}>감정 분석 중...</div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: "24px", marginBottom: "20px" }}>
          오늘의 감정 결과
        </h1>

        <div style={{ fontSize: "80px", marginBottom: "10px" }}>{emoji}</div>
        <div style={{ fontSize: "18px", marginBottom: "30px", color: "#555" }}>
          {emotion}
        </div>

        <h2 style={{ fontSize: "18px", marginBottom: "10px" }}>📘 요약</h2>
        <p
          style={{
            padding: "20px",
            border: "1px solid #ddd",
            borderRadius: "10px",
            backgroundColor: "#fafafa",
            whiteSpace: "pre-line",
            fontSize: "16px",
            maxWidth: "600px",
            margin: "0 auto",
          }}
        >
          {summary || "요약 중..."}
        </p>

        <button
          onClick={handleGenerateWebtoon}
          disabled={generating || !emotion || !summary}
          style={{
            marginTop: "30px",
            padding: "12px 20px",
            fontSize: "16px",
            backgroundColor: generating ? "#ccc" : "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            cursor: generating ? "not-allowed" : "pointer",
          }}
        >
          {generating ? "🔄 웹툰 생성 중..." : "📚 웹툰 생성하러 가기"}
        </button>
      </div>
    </PageWrapper>
  );
};

export default EmotionResult;