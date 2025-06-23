import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PageWrapper from "../components/PageWrapper";

// 기본 이미지들을 placeholder로 대체 (assets 이미지가 삭제된 경우)
const image1 = "https://via.placeholder.com/300x300/f0f0f0/333?text=Day+1";
const image2 = "https://via.placeholder.com/300x300/e8f4fd/007bff?text=Day+2";
const image3 = "https://via.placeholder.com/300x300/fff3cd/856404?text=Day+3";
const image4 = "https://via.placeholder.com/300x300/f8d7da/721c24?text=Day+4";

const WebtoonPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { inputText, emotion, summary, cuts } = location.state || {};

  const hasSaved = useRef(false);
  const imageList = [image1, image2, image3, image4];
  const [imageURL, setImageURL] = useState("");

  useEffect(() => {
    if (!inputText || !emotion || !cuts || hasSaved.current) return;
    hasSaved.current = true;

    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];

    const prev = JSON.parse(localStorage.getItem("webtoons")) || [];

    const thisWeekCount = prev.filter(item => {
      const itemDate = new Date(item.date);
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      return itemDate >= weekStart;
    }).length;

    const dayNumber = (thisWeekCount % 7) + 1;

    const newEntry = {
      id: dateStr,
      date: today.toISOString(),
      dayNumber: dayNumber,
      weekNumber: Math.floor(prev.length / 7) + 1,
      inputText,
      emotion,
      summary,
      scene: cuts.cut1 || cuts.scene,
      dialogue: cuts.bubble1 || cuts.dialogue,
      mood: cuts.mood || emotion,
      image: cuts.image_url || imageList[(prev.length) % imageList.length], // 🟢 백엔드 이미지 우선 사용
    };

    const todayExists = prev.some(item => item.id === dateStr);
    if (todayExists) {
      alert("오늘은 이미 일기를 작성했습니다!");
      navigate("/gallery");
      return;
    }

    localStorage.setItem("webtoons", JSON.stringify([...prev, newEntry]));
  }, [inputText, emotion, summary, cuts, navigate]);

  const didGenerateRef = useRef(false);

  useEffect(() => {
    if (didGenerateRef.current) return;
    didGenerateRef.current = true;
    console.log("📌 cuts 데이터 도착 확인:", cuts);
    console.log("🧾 cuts 전체 내용 확인:", JSON.stringify(cuts, null, 2));
    
    // 🟢 백엔드에서 생성한 이미지가 있으면 우선 사용
    if (cuts?.image_url) {
      console.log("✅ 백엔드에서 생성한 이미지 사용:", cuts.image_url);
      setImageURL(cuts.image_url);
      return;
    }

    // 🟢 백엔드 이미지가 없을 때만 기존 로직 실행
    const userCharacter = JSON.parse(localStorage.getItem("userCharacter") || "{}");
    
    // 사용자 캐릭터 이미지를 대체 이미지로 사용 (백업용)
    if (userCharacter.images) {
      const characterImage = userCharacter.images[emotion] || userCharacter.images["중립"];
      console.log("⚠️ 백엔드 이미지 없음, 캐릭터 이미지 사용:", characterImage);
      setImageURL(characterImage);
      return;
    }

    // 마지막 대안: 새로운 이미지 생성
    const sceneText = cuts?.scene || cuts?.cut1;
    const moodText = cuts?.mood || emotion;
  
    if (!sceneText) return;
  
    const fetchImage = async () => {
      const prompt = `${sceneText}를 따뜻하게 묘사한 감성 일러스트, ${moodText} 분위기`;
  
      console.log("📤 프롬프트:", prompt);
  
      try {
        const res = await fetch("/api/generate_image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
        });
  
        console.log("📬 응답 상태코드:", res.status);
  
        const data = await res.json();
        console.log("📥 응답 데이터:", data);
  
        if (data.url) {
          console.log("✅ 이미지 URL:", data.url);
          setImageURL(data.url);
        } else {
          console.error("❌ 이미지 생성 실패:", data.error);
        }
      } catch (err) {
        console.error("❌ 이미지 API 오류:", err);
      }
    };
  
    fetchImage();
  }, [cuts, emotion]);

  if (!inputText || !emotion || !cuts) {
    return (
      <PageWrapper>
        <p style={{ textAlign: "center", marginTop: "100px", color: "#888" }}>
          ⚠️ 웹툰을 생성할 수 없습니다. 감정 분석부터 진행해 주세요.
        </p>
      </PageWrapper>
    );
  }

  const allWebtoons = JSON.parse(localStorage.getItem("webtoons")) || [];
  const currentDayNumber = (allWebtoons.length % 7) || 7;
  const isWeekComplete = currentDayNumber === 7;

  return (
    <PageWrapper>
      <div style={{ maxWidth: "600px", margin: "0 auto", textAlign: "center" }}>
        <h2 style={{ fontSize: "26px", marginBottom: "20px" }}>
          📖 Day {currentDayNumber} 완성!
        </h2>

        {/* 오늘의 1컷 표시 */}
        <div
          style={{
            marginBottom: "30px",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            backgroundColor: "#fff",
          }}
        >
          <img
            src={imageURL || imageList[(allWebtoons.length - 1) % imageList.length]}
            alt="오늘의 컷"
            style={{
              width: "100%",
              height: "300px",
              objectFit: "cover",
              borderRadius: "10px",
              marginBottom: "15px",
            }}
          />
          <div style={{ 
            backgroundColor: "#f8f9fa", 
            padding: "15px", 
            borderRadius: "8px",
            marginBottom: "10px"
          }}>
            <p style={{ fontWeight: "bold", marginBottom: "8px", fontSize: "16px" }}>
              {cuts.cut1 || cuts.scene}
            </p>
            <p style={{ 
              fontStyle: "italic", 
              color: "#495057", 
              fontSize: "18px",
              fontWeight: "500"
            }}>
              💬 "{cuts.bubble1 || cuts.dialogue}"
            </p>
          </div>
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between",
            fontSize: "14px",
            color: "#6c757d"
          }}>
            <span>🎭 {emotion}</span>
            <span>🎨 {cuts.mood || emotion} 분위기</span>
          </div>
        </div>

        {/* 주간 진행 상황 */}
        <div style={{
          backgroundColor: "#e9ecef",
          padding: "20px",
          borderRadius: "10px",
          marginBottom: "20px"
        }}>
          <h3 style={{ fontSize: "18px", marginBottom: "15px" }}>
            📅 이번 주 진행 상황
          </h3>
          <div style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
            {[1, 2, 3, 4, 5, 6, 7].map((day) => (
              <div
                key={day}
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: day <= currentDayNumber ? "#007bff" : "#dee2e6",
                  color: day <= currentDayNumber ? "#fff" : "#6c757d",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                  fontSize: "14px"
                }}
              >
                {day}
              </div>
            ))}
          </div>
          <p style={{ marginTop: "15px", fontSize: "14px", color: "#6c757d" }}>
            {isWeekComplete 
              ? "🎉 축하합니다! 일주일 웹툰이 완성되었습니다!"
              : `${7 - currentDayNumber}일 더 작성하면 주간 웹툰이 완성됩니다!`}
          </p>
        </div>

        {/* 버튼 영역 */}
        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <button
            onClick={() => navigate("/gallery")}
            style={{
              padding: "12px 24px",
              fontSize: "16px",
              backgroundColor: "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
            }}
          >
            📁 갤러리 보기
          </button>

          {isWeekComplete && (
            <button
              onClick={() => navigate("/weekly-view")}
              style={{
                padding: "12px 24px",
                fontSize: "16px",
                backgroundColor: "#28a745",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
              }}
            >
              📚 주간 웹툰 보기
            </button>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};

export default WebtoonPage;