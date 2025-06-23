// GalleryPage.jsx - Firebase 기능을 기존 완전한 코드에 추가
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageWrapper from "../components/PageWrapper";
import FirebaseWebtoonService from "../services/FirebaseWebtoonService";

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return isMobile;
};

const GalleryPage = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [webtoons, setWebtoons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState("desc");
  const [filterEmotion, setFilterEmotion] = useState("전체");
  const [selectedItem, setSelectedItem] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [viewMode, setViewMode] = useState("card");
  const [stats, setStats] = useState(null);
  const [syncStatus, setSyncStatus] = useState('');

  // 감정 이모지 매핑
  const emotionEmojis = {
    '기쁨': '😊',
    '슬픔': '😢',
    '분노': '😡',
    '불안': '😰',
    '평온': '😌',
    '중립': '🙂'
  };

  useEffect(() => {
    loadGallery();
  }, []);

  // 🔥 Firebase + 기존 로컬 데이터를 통합한 갤러리 로드
  const loadGallery = async () => {
    try {
      setLoading(true);
      setSyncStatus('웹툰을 불러오는 중...');
      
      // Firebase에서 사용자 웹툰 로드 시도
      let firebaseWebtoons = [];
      try {
        firebaseWebtoons = await FirebaseWebtoonService.loadUserWebtoons();
        console.log(`🔥 Firebase에서 ${firebaseWebtoons.length}개 웹툰 로드`);
      } catch (error) {
        console.log('⚠️ Firebase 로드 실패, 로컬 데이터만 사용:', error);
        setSyncStatus('오프라인 모드: 로컬 데이터만 표시');
      }

      // 기존 로컬 데이터도 로드 (호환성)
      let localWebtoons = [];
      try {
        // 1순위: 기존 "webtoons" 키
        let savedWebtoons = JSON.parse(localStorage.getItem("webtoons") || "[]");
        
        // 2순위: "webtoonGallery" 키도 확인 (예전 방식 호환성)
        if (savedWebtoons.length === 0) {
          const galleryData = JSON.parse(localStorage.getItem("webtoonGallery") || "[]");
          if (galleryData.length > 0) {
            savedWebtoons = galleryData;
            console.log("📋 webtoonGallery에서 데이터 로드:", galleryData.length);
          }
        }
        localWebtoons = savedWebtoons;
      } catch (error) {
        console.error("❌ 로컬 데이터 로드 실패:", error);
      }

      // Firebase와 로컬 데이터 병합
      const allWebtoons = FirebaseWebtoonService.mergeWebtoons(firebaseWebtoons, localWebtoons);

      // 데이터 구조 검증 및 보강
      const validatedWebtoons = allWebtoons.map(item => {
        // 기본 필드 검증
        if (!item.id) item.id = Date.now() + Math.random();
        if (!item.date && !item.createdAt) item.date = new Date().toISOString();
        if (!item.emotion) item.emotion = "중립";
        
        // emotion에서 실제 감정만 추출
        let emotionText = item.emotion;
        if (typeof emotionText === 'string' && emotionText.includes(' ')) {
          const parts = emotionText.split(' ');
          emotionText = parts[parts.length - 1];
        }
        
        return {
          ...item,
          emotion: emotionText,
          date: item.createdAt || item.date,
          hasWebtoonImage: item.hasWebtoonImage || !!item.scene,
          imageType: item.hasWebtoonImage ? '웹툰 장면' : '캐릭터 이미지',
          source: item.source || (item.userId ? 'firebase' : 'local')
        };
      });

      setWebtoons(validatedWebtoons);
      
      // 통계 계산
      const calculatedStats = FirebaseWebtoonService.calculateStats(validatedWebtoons);
      setStats(calculatedStats);
      
      console.log(`📚 갤러리 로드 완료: ${validatedWebtoons.length}개 웹툰`);
      console.log('📊 Firebase vs 로컬:', {
        firebase: validatedWebtoons.filter(w => w.source === 'firebase').length,
        local: validatedWebtoons.filter(w => w.source === 'local').length
      });
      
      // 통계 정보 로깅
      const emotionCounts = {};
      const imageTypeCounts = { '웹툰 장면': 0, '캐릭터 이미지': 0 };
      
      validatedWebtoons.forEach(item => {
        emotionCounts[item.emotion] = (emotionCounts[item.emotion] || 0) + 1;
        imageTypeCounts[item.imageType] = (imageTypeCounts[item.imageType] || 0) + 1;
      });
      
      console.log("📊 감정 분포:", emotionCounts);
      console.log("🎨 이미지 타입:", imageTypeCounts);
      
      setSyncStatus('');
      
    } catch (error) {
      console.error("❌ 갤러리 로드 실패:", error);
      setWebtoons([]);
      setSyncStatus('로드 실패');
    } finally {
      setLoading(false);
    }
  };

  // 🔥 Firebase + 로컬 삭제
  const handleDeleteConfirm = async () => {
    if (!toDelete) return;
    
    try {
      console.log('🗑️ 삭제 시도 웹툰:', toDelete.id, '소스:', toDelete.source);
      
      // Firebase에서 삭제 시도 (Firebase 웹툰인 경우)
      if (toDelete.source === 'firebase' || toDelete.userId) {
        await FirebaseWebtoonService.deleteWebtoon(toDelete.id);
        console.log(`🔥 Firebase에서 웹툰 삭제: ${toDelete.id}`);
      } else {
        console.log(`📱 로컬 웹툰 삭제: ${toDelete.id}`);
      }
      
      // 로컬에서도 삭제
      const updated = webtoons.filter((item) => item.id !== toDelete.id);
      setWebtoons(updated);
      
      // 로컬 스토리지 업데이트 (로컬 웹툰들만)
      const localWebtoons = updated.filter(w => w.source === 'local');
      localStorage.setItem("webtoons", JSON.stringify(localWebtoons));
      localStorage.setItem("webtoonGallery", JSON.stringify(localWebtoons));
      
      // 통계 업데이트
      const newStats = FirebaseWebtoonService.calculateStats(updated);
      setStats(newStats);
      
      setToDelete(null);
      console.log(`🗑️ 웹툰 삭제 완료: ${toDelete.id}`);
      
      // 성공 알림
      alert('웹툰이 삭제되었습니다.');
      
    } catch (error) {
      console.error('❌ 웹툰 삭제 실패:', error);
      
      // 사용자 친화적 에러 메시지
      let errorMessage = '웹툰 삭제 중 오류가 발생했습니다.';
      
      if (error.message.includes('권한')) {
        errorMessage = '삭제 권한이 없습니다. 본인이 만든 웹툰만 삭제할 수 있습니다.';
      } else if (error.message.includes('찾을 수 없습니다')) {
        errorMessage = '삭제하려는 웹툰을 찾을 수 없습니다.';
      } else if (error.message.includes('네트워크')) {
        errorMessage = '네트워크 오류입니다. 인터넷 연결을 확인해주세요.';
        // 네트워크 오류인 경우 로컬에서라도 삭제
        const updated = webtoons.filter((item) => item.id !== toDelete.id);
        setWebtoons(updated);
        setToDelete(null);
        errorMessage += '\n로컬에서는 삭제되었습니다.';
      }
      
      alert(errorMessage);
      setToDelete(null);
    }
  };

  // 🔄 로컬 데이터를 Firebase로 동기화
  const handleSync = async () => {
    try {
      setSyncStatus('동기화 중...');
      await FirebaseWebtoonService.syncLocalToFirebase();
      await loadGallery();
      setSyncStatus('동기화 완료!');
      setTimeout(() => setSyncStatus(''), 2000);
    } catch (error) {
      console.error('❌ 동기화 실패:', error);
      setSyncStatus('동기화 실패');
      setTimeout(() => setSyncStatus(''), 3000);
    }
  };

  // 날짜 포맷팅
  const formatDate = (iso) => {
    const date = new Date(iso);
    const today = new Date().toISOString().split("T")[0];
    const dateStr = date.toISOString().split("T")[0];
    const time = date.toTimeString().slice(0, 5);
    
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const dayName = dayNames[date.getDay()];
    
    if (dateStr === today) {
      return `오늘 (${dayName}) ${time}`;
    } else {
      const month = date.getMonth() + 1;
      const day = date.getDate();
      return `${month}/${day}(${dayName}) ${time}`;
    }
  };

  // 필터링 및 정렬 로직
  const displayed = [...webtoons]
    .filter((item) => {
      if (filterEmotion === "전체") return true;
      const itemEmotion = item.emotion || "";
      return itemEmotion === filterEmotion || itemEmotion.includes(filterEmotion);
    })
    .sort((a, b) => {
      const aDate = new Date(a.date);
      const bDate = new Date(b.date);
      return sortOrder === "desc" ? bDate - aDate : aDate - bDate;
    });

  // 통계 계산
  const emotionStats = {};
  webtoons.forEach(item => {
    const emotion = item.emotion || "중립";
    emotionStats[emotion] = (emotionStats[emotion] || 0) + 1;
  });

  // 전체 갤러리 삭제
  const clearGallery = async () => {
    if (window.confirm('정말로 모든 웹툰을 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.')) {
      try {
        await FirebaseWebtoonService.clearAllData();
        setWebtoons([]);
        setStats(null);
        console.log('🗑️ 갤러리 전체 삭제 완료');
      } catch (error) {
        console.error('❌ 갤러리 삭제 실패:', error);
        // Firebase 실패시 로컬만 삭제
        localStorage.removeItem('webtoons');
        localStorage.removeItem('webtoonGallery');
        setWebtoons([]);
        alert('일부 데이터 삭제에 실패했을 수 있습니다.');
      }
    }
  };

  if (loading) {
    return (
      <PageWrapper>
        <div style={{ 
          textAlign: "center", 
          padding: "100px 20px",
          fontSize: "18px",
          color: "#666"
        }}>
          <div style={{ fontSize: "48px", marginBottom: "20px" }}>📚</div>
          <div>갤러리를 불러오는 중...</div>
          {syncStatus && (
            <div style={{ marginTop: "10px", fontSize: "14px" }}>{syncStatus}</div>
          )}
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <h1 style={{ fontSize: "26px", textAlign: "center", marginBottom: "10px" }}>
        📚 나의 감정 웹툰 갤러리
      </h1>
      
      {/* 갤러리 통계 표시 */}
      <div style={{ 
        textAlign: "center", 
        marginBottom: "20px",
        color: "#666",
        fontSize: "14px"
      }}>
        <div>총 {webtoons.length}개의 웹툰을 만들었어요!</div>
        {stats && stats.recentCount > 0 && (
          <div style={{ marginTop: "5px" }}>
            최근 일주일간 {stats.recentCount}개 생성
          </div>
        )}
        {Object.keys(emotionStats).length > 0 && (
          <div style={{ marginTop: "5px" }}>
            {Object.entries(emotionStats)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 3)
              .map(([emotion, count]) => (
                <span key={emotion} style={{ margin: "0 8px" }}>
                  {emotionEmojis[emotion] || '🙂'} {emotion} {count}개
                </span>
              ))}
          </div>
        )}
      </div>

      {/* 동기화 상태 표시 */}
      {syncStatus && (
        <div style={{
          background: syncStatus.includes('실패') ? "#ffebee" : "#e3f2fd",
          color: syncStatus.includes('실패') ? "#c62828" : "#1976d2",
          padding: "10px",
          borderRadius: "8px",
          textAlign: "center",
          marginBottom: "20px",
          fontSize: "14px"
        }}>
          🔄 {syncStatus}
        </div>
      )}

      {/* 필터 & 정렬 & 기능 버튼 */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        gap: "12px",
        margin: "20px 0",
        flexWrap: "wrap",
        marginBottom: "20px",
      }}>
        <button
          onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
          style={{
            padding: "12px 20px",
            fontSize: "14px",
            backgroundColor: "#eee",
            border: "1px solid #ccc",
            borderRadius: "10px",
            cursor: "pointer",
            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
            transition: "transform 0.2s",
          }}
          onMouseOver={(e) => e.target.style.transform = "translateY(-2px)"}
          onMouseOut={(e) => e.target.style.transform = "translateY(0)"}
        >
          📅 {sortOrder === "desc" ? "최신순" : "오래된순"}
        </button>

        <select
          onChange={(e) => setFilterEmotion(e.target.value)}
          value={filterEmotion}
          style={{
            padding: "12px 20px",
            fontSize: "14px",
            borderRadius: "10px",
            border: "1px solid #ccc",
            backgroundColor: "#fff",
            cursor: "pointer",
            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
          }}
        >
          <option value="전체">전체 감정 ({webtoons.length})</option>
          {Object.entries(emotionStats).map(([emotion, count]) => (
            <option key={emotion} value={emotion}>
              {emotionEmojis[emotion] || '🙂'} {emotion} ({count})
            </option>
          ))}
        </select>

        <button
          onClick={() => setViewMode(viewMode === "card" ? "list" : "card")}
          style={{
            padding: "12px 20px",
            fontSize: "14px",
            backgroundColor: viewMode === "card" ? "#007bff" : "#eee",
            color: viewMode === "card" ? "#fff" : "#333",
            border: "1px solid #ccc",
            borderRadius: "10px",
            cursor: "pointer",
            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
            transition: "transform 0.2s",
          }}
          onMouseOver={(e) => e.target.style.transform = "translateY(-2px)"}
          onMouseOut={(e) => e.target.style.transform = "translateY(0)"}
        >
          {viewMode === "card" ? "📋 리스트" : "🎴 카드"}
        </button>

        <button
          onClick={handleSync}
          style={{
            padding: "12px 20px",
            fontSize: "14px",
            backgroundColor: "#28a745",
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            boxShadow: "0 2px 6px rgba(40, 167, 69, 0.3)",
            transition: "transform 0.2s",
          }}
          onMouseOver={(e) => e.target.style.transform = "translateY(-2px)"}
          onMouseOut={(e) => e.target.style.transform = "translateY(0)"}
        >
          🔄 동기화
        </button>

        <button
          onClick={() => navigate("/stats")}
          style={{
            padding: "12px 20px",
            fontSize: "14px",
            backgroundColor: "#6f42c1",
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            boxShadow: "0 2px 6px rgba(111, 66, 193, 0.3)",
            transition: "transform 0.2s",
          }}
          onMouseOver={(e) => e.target.style.transform = "translateY(-2px)"}
          onMouseOut={(e) => e.target.style.transform = "translateY(0)"}
        >
          📊 감정 통계
        </button>

        {webtoons.length > 0 && (
          <button
            onClick={clearGallery}
            style={{
              padding: "12px 20px",
              fontSize: "14px",
              backgroundColor: "#dc3545",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(220, 53, 69, 0.3)",
              transition: "transform 0.2s",
            }}
            onMouseOver={(e) => e.target.style.transform = "translateY(-2px)"}
            onMouseOut={(e) => e.target.style.transform = "translateY(0)"}
          >
            🗑️ 전체 삭제
          </button>
        )}
      </div>

      {/* 필터링 결과 표시 */}
      <div style={{ 
        textAlign: "center", 
        marginBottom: "20px",
        color: "#666",
        fontSize: "14px"
      }}>
        {filterEmotion !== "전체" ? (
          <span>
            {emotionEmojis[filterEmotion]} {filterEmotion} 감정: {displayed.length}개
            {displayed.length !== webtoons.length && (
              <span style={{ marginLeft: "10px", color: "#999" }}>
                (전체 {webtoons.length}개 중)
              </span>
            )}
          </span>
        ) : (
          webtoons.length >= 7 && (
            <span style={{ color: "#9c27b0", fontWeight: "bold" }}>
              📚 주간 웹툰 생성 가능! ({webtoons.length}개)
            </span>
          )
        )}
      </div>

      {/* 웹툰 없을 때 */}
      {webtoons.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "80px 20px",
          color: "#999"
        }}>
          <div style={{ fontSize: "64px", marginBottom: "20px" }}>📝</div>
          <h3 style={{ marginBottom: "10px" }}>아직 만든 웹툰이 없어요</h3>
          <p style={{ marginBottom: "30px" }}>첫 번째 감정 일기를 작성해보세요!</p>
          <button
            onClick={() => navigate("/input")}
            style={{
              padding: "15px 30px",
              backgroundColor: "#28a745",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "16px"
            }}
          >
            📝 첫 일기 작성하기
          </button>
        </div>
      ) : (
        <>
          {/* 카드 뷰 */}
          {viewMode === "card" && (
            <div style={{
              display: "grid",
              gridTemplateColumns: isMobile
                ? "repeat(auto-fill, minmax(280px, 1fr))"
                : "repeat(auto-fill, minmax(350px, 1fr))",
              gap: isMobile ? "16px" : "20px",
              marginBottom: "30px"
            }}>
              {displayed.map((item, index) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  style={{
                    backgroundColor: "#fff",
                    borderRadius: "16px",
                    overflow: "hidden",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    cursor: "pointer",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    position: "relative",
                    border: item.source === 'firebase' ? "2px solid #4caf50" : "1px solid #e0e0e0"
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.15)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                  }}
                >
                  {/* 소스 표시 */}
                  <div style={{
                    position: "absolute",
                    top: "8px",
                    right: "8px",
                    fontSize: "10px",
                    padding: "2px 6px",
                    background: item.source === 'firebase' ? "#4caf50" : "#ff9800",
                    color: "white",
                    borderRadius: "4px",
                    zIndex: 2
                  }}>
                    {item.source === 'firebase' ? '☁️' : '📱'}
                  </div>

                  {/* 이미지 */}
                  <div style={{ position: "relative" }}>
                    <img
                      src={item.image}
                      alt={item.emotion}
                      style={{
                        width: "100%",
                        height: isMobile ? "200px" : "240px",
                        objectFit: "cover"
                      }}
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/350x240?text=이미지+없음";
                      }}
                    />
                    
                    {/* 감정 배지 */}
                    <div style={{
                      position: "absolute",
                      bottom: "8px",
                      left: "8px",
                      background: "rgba(0,0,0,0.7)",
                      color: "white",
                      padding: "4px 8px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: "bold"
                    }}>
                      {emotionEmojis[item.emotion] || '🙂'} {item.emotion}
                    </div>

                    {/* 이미지 타입 배지 */}
                    <div style={{
                      position: "absolute",
                      bottom: "8px",
                      right: "8px",
                      background: item.hasWebtoonImage ? "rgba(76, 175, 80, 0.9)" : "rgba(255, 152, 0, 0.9)",
                      color: "white",
                      padding: "2px 6px",
                      borderRadius: "8px",
                      fontSize: "10px"
                    }}>
                      {item.imageType}
                    </div>
                  </div>

                  {/* 컨텐츠 */}
                  <div style={{ padding: "16px" }}>
                    <p style={{ 
                      color: "#333", 
                      fontSize: "14px",
                      lineHeight: "1.4",
                      margin: "0 0 12px 0",
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden"
                    }}>
                      {item.summary || item.inputText}
                    </p>
                    
                    <div style={{ 
                      fontSize: "12px", 
                      color: "#666",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}>
                      <span>{formatDate(item.date)}</span>
                      {item.emotion_intensity && (
                        <span style={{ 
                          background: "#f0f0f0",
                          padding: "2px 6px",
                          borderRadius: "4px"
                        }}>
                          강도: {item.emotion_intensity}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 삭제 버튼 */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setToDelete(item);
                    }}
                    style={{
                      position: "absolute",
                      top: "8px",
                      left: "8px",
                      background: "rgba(255, 255, 255, 0.9)",
                      border: "none",
                      borderRadius: "50%",
                      width: "24px",
                      height: "24px",
                      fontSize: "12px",
                      color: "#666",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 2
                    }}
                  >
                    ✖
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* 리스트 뷰 */}
          {viewMode === "list" && (
            <div style={{ maxWidth: "800px", margin: "0 auto" }}>
              {displayed.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  style={{
                    display: "flex",
                    gap: "15px",
                    padding: "15px",
                    border: "1px solid #ddd",
                    borderRadius: "12px",
                    backgroundColor: "#fff",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                    cursor: "pointer",
                    marginBottom: "12px",
                    position: "relative",
                    transition: "transform 0.2s",
                    borderLeft: item.source === 'firebase' ? "4px solid #4caf50" : "4px solid #ff9800"
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
                  onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
                >
                  {/* 썸네일 */}
                  <img
                    src={item.image}
                    alt="웹툰 썸네일"
                    style={{
                      width: "80px",
                      height: "80px",
                      objectFit: "cover",
                      borderRadius: "8px",
                      flexShrink: 0
                    }}
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/80x80?text=이미지+없음";
                    }}
                  />

                  {/* 정보 */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ 
                      display: "flex", 
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "8px"
                    }}>
                      <span style={{ 
                        fontWeight: "bold", 
                        fontSize: "16px",
                        color: "#333"
                      }}>
                        {emotionEmojis[item.emotion] || '🙂'} {item.emotion}
                      </span>
                      <span style={{ 
                        fontSize: "12px", 
                        color: "#666",
                        flexShrink: 0,
                        marginLeft: "10px"
                      }}>
                        {formatDate(item.date)}
                      </span>
                    </div>
                    
                    <p style={{ 
                      color: "#666", 
                      fontSize: "14px",
                      margin: "0 0 8px 0",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      lineHeight: "1.4"
                    }}>
                      {item.summary || item.inputText}
                    </p>

                    <div style={{
                      display: "flex",
                      gap: "8px",
                      fontSize: "10px"
                    }}>
                      <span style={{ 
                        background: item.hasWebtoonImage ? "#e8f5e8" : "#fff3e0",
                        color: item.hasWebtoonImage ? "#2e7d32" : "#ef6c00",
                        padding: "2px 6px",
                        borderRadius: "4px"
                      }}>
                        {item.imageType}
                      </span>
                      <span style={{ 
                        background: item.source === 'firebase' ? "#e8f5e8" : "#fff3e0",
                        color: item.source === 'firebase' ? "#2e7d32" : "#ef6c00",
                        padding: "2px 6px",
                        borderRadius: "4px"
                      }}>
                        {item.source === 'firebase' ? '클라우드' : '로컬'}
                      </span>
                    </div>
                  </div>

                  {/* 삭제 버튼 */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setToDelete(item);
                    }}
                    style={{
                      position: "absolute",
                      top: "8px",
                      right: "8px",
                      background: "rgba(255, 255, 255, 0.9)",
                      border: "none",
                      borderRadius: "50%",
                      width: "20px",
                      height: "20px",
                      fontSize: "10px",
                      color: "#666",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    ✖
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* 주간 웹툰 생성 버튼 */}
      {webtoons.length >= 7 && (
        <div style={{ textAlign: "center", marginTop: "30px" }}>
          <button
            onClick={() => navigate("/weekly")}
            style={{
              padding: "15px 30px",
              backgroundColor: "#9c27b0",
              color: "#fff",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "bold",
              boxShadow: "0 4px 12px rgba(156, 39, 176, 0.3)"
            }}
          >
            📚 주간 웹툰 만들기
          </button>
        </div>
      )}

      {/* 새 일기 작성 버튼 */}
      {webtoons.length > 0 && (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <button
            onClick={() => navigate("/input")}
            style={{
              padding: "12px 24px",
              backgroundColor: "#28a745",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px"
            }}
          >
            새 일기 작성
          </button>
        </div>
      )}

      {/* 상세 모달 */}
      {selectedItem && (
        <div onClick={() => setSelectedItem(null)} style={modalBgStyle}>
          <div
            onClick={(e) => e.stopPropagation()}
            style={getModalBoxStyle(isMobile)}
          >
            <h3 style={{ marginBottom: "15px", display: "flex", alignItems: "center", gap: "8px" }}>
              {emotionEmojis[selectedItem.emotion] || '🙂'} {selectedItem.emotion} 웹툰 상세보기
              <span style={{
                fontSize: "10px",
                padding: "2px 6px",
                background: selectedItem.source === 'firebase' ? "#4caf50" : "#ff9800",
                color: "white",
                borderRadius: "4px"
              }}>
                {selectedItem.source === 'firebase' ? '☁️ 클라우드' : '📱 로컬'}
              </span>
            </h3>
            
            <img
              src={selectedItem.image}
              alt="웹툰 전체"
              style={{
                width: "100%",
                borderRadius: "8px",
                marginBottom: "15px",
              }}
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/400x300?text=이미지+없음";
              }}
            />

            <div style={{ marginBottom: "15px", fontSize: "12px", color: "#888" }}>
              📅 {formatDate(selectedItem.date)} • {selectedItem.imageType}
              {selectedItem.emotion_intensity && (
                <span> • 감정 강도: {selectedItem.emotion_intensity}</span>
              )}
            </div>

            {selectedItem.scene && (
              <div style={{ marginBottom: "15px" }}>
                <h4 style={{ fontSize: "14px", marginBottom: "5px", color: "#333" }}>📍 장면</h4>
                <p style={{ fontSize: "14px", color: "#666" }}>{selectedItem.scene}</p>
              </div>
            )}

            {selectedItem.dialogue && (
              <div style={{ marginBottom: "15px" }}>
                <h4 style={{ fontSize: "14px", marginBottom: "5px", color: "#333" }}>💬 대사</h4>
                <p style={{ fontSize: "14px", color: "#666", fontStyle: "italic" }}>
                  "{selectedItem.dialogue}"
                </p>
              </div>
            )}

            <div style={{ marginBottom: "15px" }}>
              <h4 style={{ fontSize: "14px", marginBottom: "5px", color: "#333" }}>📝 일기 내용</h4>
              <p style={{ fontSize: "14px", color: "#666", lineHeight: "1.5" }}>
                {selectedItem.summary || selectedItem.inputText}
              </p>
            </div>

            {selectedItem.keywords && selectedItem.keywords.length > 0 && (
              <div style={{ marginBottom: "20px" }}>
                <h4 style={{ fontSize: "14px", marginBottom: "5px", color: "#333" }}>🔖 키워드</h4>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                  {selectedItem.keywords.map((keyword, index) => (
                    <span 
                      key={index}
                      style={{
                        background: "#f0f0f0",
                        padding: "2px 8px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        color: "#333"
                      }}
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setSelectedItem(null)}
              style={{
                width: "100%",
                padding: "10px",
                backgroundColor: "#007bff",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {toDelete && (
        <div style={modalBgStyle}>
          <div style={{
            backgroundColor: "#fff",
            padding: "30px",
            borderRadius: "12px",
            width: "90%",
            maxWidth: "400px",
            textAlign: "center"
          }}>
            <h3 style={{ color: "#333", marginBottom: "15px" }}>
              🗑️ 웹툰 삭제
            </h3>
            <p style={{ color: "#555", fontSize: "14px", margin: "16px 0" }}>
              정말로 이 웹툰을 삭제하시겠습니까?<br/>
              <strong style={{ color: "#d32f2f" }}>
                "{emotionEmojis[toDelete.emotion]} {toDelete.emotion}"
              </strong><br/>
              {toDelete.source === 'firebase' ? 
                '클라우드와 로컬에서 모두 삭제됩니다.' : 
                '로컬에서만 삭제됩니다.'
              }<br/>
              <strong style={{ color: "#d32f2f" }}>이 작업은 되돌릴 수 없습니다.</strong>
            </p>
            <div style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "8px",
            }}>
              <button
                onClick={() => setToDelete(null)}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#eee",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                취소
              </button>
              <button
                onClick={handleDeleteConfirm}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#f44336",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                삭제하기
              </button>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
};

const modalBgStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
};

const getModalBoxStyle = (isMobile) => ({
  backgroundColor: "#fff",
  padding: isMobile ? "16px" : "20px",
  borderRadius: "12px",
  width: "90%",
  maxWidth: isMobile ? "320px" : "500px",
  maxHeight: "90vh",
  overflowY: "auto",
  boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
});

export default GalleryPage;