import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import PageWrapper from "../components/PageWrapper";

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return isMobile;
};

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
  평온: "#90EE90",
  중립: "#A9A9A9",
  긍정: "#2ecc71",
  부정: "#e74c3c",
  중립_파이: "#95a5a6",
};

const emotionEmojis = {
  '기쁨': '😊',
  '슬픔': '😢',
  '분노': '😡',
  '불안': '😰',
  '평온': '😌',
  '중립': '🙂'
};

const StatsPage = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [emotionCounts, setEmotionCounts] = useState([]);
  const [sentimentCounts, setSentimentCounts] = useState([]);
  const [dailyStats, setDailyStats] = useState([]);
  const [totalStats, setTotalStats] = useState({});
  const [timeRange, setTimeRange] = useState("7"); // 7일, 30일, 전체

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("webtoons")) || [];
    
    if (saved.length === 0) {
      return;
    }

    // 시간 범위 필터링
    const now = new Date();
    const filteredData = saved.filter(item => {
      if (timeRange === "all") return true;
      const itemDate = new Date(item.date);
      const daysDiff = (now - itemDate) / (1000 * 60 * 60 * 24);
      return daysDiff <= parseInt(timeRange);
    });

    // 감정별 통계
    const emotionMap = {};
    const sentimentMap = { 긍정: 0, 부정: 0, 중립: 0 };
    
    // 일별 통계를 위한 맵
    const dailyMap = {};

    filteredData.forEach((item) => {
      let emotion = item.emotion;
      if (typeof emotion === 'string' && emotion.includes(' ')) {
        emotion = emotion.split(' ').pop(); // 이모지 제거
      }
      
      if (emotion) {
        emotionMap[emotion] = (emotionMap[emotion] || 0) + 1;
        const category = categorize(emotion);
        sentimentMap[category]++;

        // 일별 통계
        const dateStr = new Date(item.date).toISOString().split('T')[0];
        if (!dailyMap[dateStr]) {
          dailyMap[dateStr] = {};
        }
        dailyMap[dateStr][emotion] = (dailyMap[dateStr][emotion] || 0) + 1;
      }
    });

    // 감정 데이터 정렬 (많은 순)
    const emotionData = Object.entries(emotionMap)
      .map(([emotion, count]) => ({
        name: emotion,
        count,
        emoji: emotionEmojis[emotion] || '🙂'
      }))
      .sort((a, b) => b.count - a.count);

    const sentimentData = Object.entries(sentimentMap).map(
      ([label, value]) => ({
        name: label,
        value,
        percentage: saved.length > 0 ? ((value / saved.length) * 100).toFixed(1) : 0
      })
    );

    // 일별 통계 (최근 14일)
    const last14Days = [];
    for (let i = 13; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayData = dailyMap[dateStr] || {};
      
      last14Days.push({
        date: dateStr,
        displayDate: `${date.getMonth() + 1}/${date.getDate()}`,
        ...dayData,
        total: Object.values(dayData).reduce((sum, count) => sum + count, 0)
      });
    }

    // 전체 통계
    const mostCommonEmotion = emotionData[0];
    const totalEntries = saved.length;
    const averagePerDay = timeRange === "all" ? 
      (totalEntries / Math.max(1, (now - new Date(saved[0]?.date || now)) / (1000 * 60 * 60 * 24))).toFixed(1) :
      (filteredData.length / parseInt(timeRange)).toFixed(1);

    setEmotionCounts(emotionData);
    setSentimentCounts(sentimentData);
    setDailyStats(last14Days);
    setTotalStats({
      total: totalEntries,
      filtered: filteredData.length,
      mostCommon: mostCommonEmotion,
      averagePerDay,
      firstEntry: saved[saved.length - 1]?.date,
      latestEntry: saved[0]?.date
    });
  }, [timeRange]);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  return (
    <PageWrapper>
      <div style={{
        maxWidth: "900px",
        margin: "0 auto",
        padding: isMobile ? "10px" : "20px",
        fontFamily: "'Apple SD Gothic Neo', sans-serif",
      }}>
        {/* 헤더 */}
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h1 style={{ 
            fontSize: "26px", 
            marginBottom: "10px",
            background: "linear-gradient(45deg, #667eea 0%, #764ba2 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
            📊 나의 감정 분석 리포트
          </h1>
          <p style={{ color: "#666", fontSize: "14px" }}>
            웹툰으로 기록한 나의 감정 패턴을 분석해보세요
          </p>
        </div>

        {/* 시간 범위 선택 */}
        <div style={{ 
          display: "flex", 
          justifyContent: "center", 
          gap: "10px", 
          marginBottom: "30px",
          flexWrap: "wrap"
        }}>
          {[
            { value: "7", label: "최근 7일" },
            { value: "30", label: "최근 30일" },
            { value: "all", label: "전체 기간" }
          ].map(option => (
            <button
              key={option.value}
              onClick={() => setTimeRange(option.value)}
              style={{
                padding: "8px 16px",
                backgroundColor: timeRange === option.value ? "#667eea" : "#f8f9fa",
                color: timeRange === option.value ? "#fff" : "#333",
                border: "1px solid #ddd",
                borderRadius: "20px",
                cursor: "pointer",
                fontSize: "14px",
                transition: "all 0.2s"
              }}
            >
              {option.label}
            </button>
          ))}
        </div>

        {totalStats.total === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "60px 20px",
            color: "#666"
          }}>
            <div style={{ fontSize: "48px", marginBottom: "20px" }}>📊</div>
            <h3 style={{ marginBottom: "10px" }}>아직 분석할 데이터가 없어요!</h3>
            <p style={{ marginBottom: "30px" }}>일기를 작성해서 감정 데이터를 쌓아보세요</p>
            <button
              onClick={() => navigate('/input')}
              style={{
                padding: "15px 30px",
                fontSize: "16px",
                backgroundColor: "#28a745",
                color: "#fff",
                border: "none",
                borderRadius: "12px",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(40, 167, 69, 0.3)"
              }}
            >
              ✏️ 첫 일기 작성하기
            </button>
          </div>
        ) : (
          <>
            {/* 전체 통계 카드 */}
            <div style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)",
              gap: "15px",
              marginBottom: "40px"
            }}>
              <div style={statCardStyle}>
                <div style={{ fontSize: "24px", color: "#667eea" }}>📚</div>
                <div style={{ fontSize: "20px", fontWeight: "bold", color: "#333" }}>
                  {totalStats.total}
                </div>
                <div style={{ fontSize: "12px", color: "#666" }}>총 웹툰</div>
              </div>
              
              <div style={statCardStyle}>
                <div style={{ fontSize: "24px" }}>
                  {totalStats.mostCommon?.emoji || '😊'}
                </div>
                <div style={{ fontSize: "16px", fontWeight: "bold", color: "#333" }}>
                  {totalStats.mostCommon?.name || '-'}
                </div>
                <div style={{ fontSize: "12px", color: "#666" }}>
                  최다 감정 ({totalStats.mostCommon?.count || 0}회)
                </div>
              </div>

              <div style={statCardStyle}>
                <div style={{ fontSize: "24px", color: "#fd7e14" }}>📈</div>
                <div style={{ fontSize: "20px", fontWeight: "bold", color: "#333" }}>
                  {totalStats.averagePerDay}
                </div>
                <div style={{ fontSize: "12px", color: "#666" }}>일평균 작성</div>
              </div>

              <div style={statCardStyle}>
                <div style={{ fontSize: "24px", color: "#28a745" }}>⏱️</div>
                <div style={{ fontSize: "16px", fontWeight: "bold", color: "#333" }}>
                  {totalStats.firstEntry ? 
                    Math.ceil((new Date() - new Date(totalStats.firstEntry)) / (1000 * 60 * 60 * 24)) : 0
                  }일
                </div>
                <div style={{ fontSize: "12px", color: "#666" }}>연속 기록</div>
              </div>
            </div>

            {/* 감정별 빈도 */}
            <section style={sectionStyle}>
              <h2 style={sectionTitleStyle}>
                📌 감정별 분포 ({timeRange === "all" ? "전체" : `최근 ${timeRange}일`})
              </h2>
              <div style={{
                background: "#fff",
                borderRadius: "12px",
                padding: "20px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
              }}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={emotionCounts}>
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `${emotionEmojis[value] || '🙂'} ${value}`}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      formatter={(value, name) => [`${value}개`, '웹툰 수']}
                      labelFormatter={(label) => `${emotionEmojis[label] || '🙂'} ${label}`}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {emotionCounts.map((entry, index) => (
                        <Cell key={index} fill={COLORS[entry.name] || COLORS.중립} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* 긍정/부정 비율 */}
            <section style={sectionStyle}>
              <h2 style={sectionTitleStyle}>
                🎯 감정 극성 분석
              </h2>
              <div style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                gap: "20px"
              }}>
                <div style={{
                  background: "#fff",
                  borderRadius: "12px",
                  padding: "20px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                }}>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={sentimentCounts}
                        dataKey="value"
                        nameKey="name"
                        outerRadius={80}
                        label={({name, percentage}) => `${name} ${percentage}%`}
                      >
                        {sentimentCounts.map((entry, index) => (
                          <Cell
                            key={index}
                            fill={COLORS[entry.name === "중립" ? "중립_파이" : entry.name]}
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}개`, '웹툰 수']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                  {sentimentCounts.map((item, index) => (
                    <div key={index} style={{
                      background: "#fff",
                      borderRadius: "12px",
                      padding: "20px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      borderLeft: `4px solid ${COLORS[item.name === "중립" ? "중립_파이" : item.name]}`
                    }}>
                      <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}>
                        <span style={{ fontWeight: "bold", fontSize: "16px" }}>
                          {item.name === "긍정" ? "😊" : item.name === "부정" ? "😔" : "😐"} {item.name}
                        </span>
                        <span style={{ fontSize: "20px", fontWeight: "bold" }}>
                          {item.value}개
                        </span>
                      </div>
                      <div style={{ 
                        fontSize: "14px", 
                        color: "#666", 
                        marginTop: "5px" 
                      }}>
                        전체의 {item.percentage}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 일별 추이 */}
            <section style={sectionStyle}>
              <h2 style={sectionTitleStyle}>
                📈 최근 14일 감정 변화
              </h2>
              <div style={{
                background: "#fff",
                borderRadius: "12px",
                padding: "20px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
              }}>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={dailyStats}>
                    <XAxis 
                      dataKey="displayDate" 
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip 
                      formatter={(value, name) => [`${value}개`, '웹툰 수']}
                      labelFormatter={(label) => `${label}`}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="total" 
                      stroke="#667eea" 
                      fill="#667eea" 
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* 액션 버튼 */}
            <div style={{
              display: "flex",
              justifyContent: "center",
              gap: "15px",
              marginTop: "40px",
              flexWrap: "wrap"
            }}>
              <button
                onClick={() => navigate('/gallery')}
                style={{
                  padding: "12px 24px",
                  backgroundColor: "#667eea",
                  color: "#fff",
                  border: "none",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontSize: "14px",
                  boxShadow: "0 2px 6px rgba(102, 126, 234, 0.3)"
                }}
              >
                📚 갤러리 보기
              </button>
              <button
                onClick={() => navigate('/input')}
                style={{
                  padding: "12px 24px",
                  backgroundColor: "#28a745",
                  color: "#fff",
                  border: "none",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontSize: "14px",
                  boxShadow: "0 2px 6px rgba(40, 167, 69, 0.3)"
                }}
              >
                ✏️ 새 일기 작성
              </button>
            </div>
          </>
        )}
      </div>
    </PageWrapper>
  );
};

const statCardStyle = {
  background: "#fff",
  borderRadius: "12px",
  padding: "20px",
  textAlign: "center",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  border: "1px solid #f0f0f0"
};

const sectionStyle = {
  marginBottom: "40px"
};

const sectionTitleStyle = {
  fontSize: "18px",
  marginBottom: "20px",
  color: "#333",
  fontWeight: "600"
};

export default StatsPage;