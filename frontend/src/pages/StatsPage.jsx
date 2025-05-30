import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import PageWrapper from "../components/PageWrapper"; // ✅ 추가

const categorize = (emotion) => {
  if (emotion.includes("기쁨")) return "긍정";
  if (
    emotion.includes("슬픔") ||
    emotion.includes("분노") ||
    emotion.includes("불안")
  )
    return "부정";
  return "중립";
};

const COLORS = {
  기쁨: "#FFD700",
  슬픔: "#6495ED",
  분노: "#FF6347",
  불안: "#A0522D",
  중립: "#A9A9A9",
  긍정: "#2ecc71",
  부정: "#e74c3c",
  중립_파이: "#95a5a6",
};

const StatsPage = () => {
  const [emotionCounts, setEmotionCounts] = useState([]);
  const [sentimentCounts, setSentimentCounts] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("webtoons")) || [];

    const emotionMap = {};
    const sentimentMap = { 긍정: 0, 부정: 0, 중립: 0 };

    saved.forEach((item) => {
      const emotion = item.emotion?.split(" ")[0];
      if (emotion) {
        emotionMap[emotion] = (emotionMap[emotion] || 0) + 1;
        const category = categorize(emotion);
        sentimentMap[category]++;
      }
    });

    const emotionData = Object.entries(emotionMap).map(([emotion, count]) => ({
      name: emotion,
      count,
    }));

    const sentimentData = Object.entries(sentimentMap).map(
      ([label, value]) => ({
        name: label,
        value,
      })
    );

    setEmotionCounts(emotionData);
    setSentimentCounts(sentimentData);
  }, []);

  return (
    <PageWrapper>
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          fontFamily: "'Apple SD Gothic Neo', sans-serif",
        }}
      >
        <h1 style={{ fontSize: "26px", textAlign: "center" }}>📊 감정 통계</h1>

        <section style={{ marginTop: "30px" }}>
          <h2 style={{ fontSize: "18px", marginBottom: "12px" }}>
            📌 감정별 빈도 (Bar Chart)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={emotionCounts}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count">
                {emotionCounts.map((entry, index) => (
                  <Cell key={index} fill={COLORS[entry.name]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </section>

        <section style={{ marginTop: "50px" }}>
          <h2 style={{ fontSize: "18px", marginBottom: "12px" }}>
            🎯 긍정 / 부정 / 중립 비율 (Pie Chart)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sentimentCounts}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label
              >
                {sentimentCounts.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={
                      COLORS[entry.name === "중립" ? "중립_파이" : entry.name]
                    }
                  />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </section>
      </div>
    </PageWrapper>
  );
};

export default StatsPage;
