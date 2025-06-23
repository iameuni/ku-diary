// GalleryPage.jsx - 예전 방식 장점 적용 🔄
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

const GalleryPage = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [webtoons, setWebtoons] = useState([]);
  const [sortOrder, setSortOrder] = useState("desc");
  const [filterEmotion, setFilterEmotion] = useState("전체");
  const [selectedItem, setSelectedItem] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [viewMode, setViewMode] = useState("card"); // 🔄 예전 방식: 카드/리스트 뷰

  // 🔄 예전 방식: 감정 이모지 매핑
  const emotionEmojis = {
    '기쁨': '😊',
    '슬픔': '😢',
    '분노': '😡',
    '불안': '😰',
    '평온': '😌',
    '중립': '🙂'
  };

  useEffect(() => {
    // 🔄 예전 방식: 여러 저장소에서 로드 시도
    loadGallery();
  }, []);

  // 🔄 예전 방식: 갤러리 로드 로직 개선
  const loadGallery = () => {
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

      // 🔄 예전 방식: 데이터 구조 검증 및 보강
      const validatedWebtoons = savedWebtoons.map(item => {
        // 기본 필드 검증
        if (!item.id) item.id = Date.now() + Math.random();
        if (!item.date) item.date = new Date().toISOString();
        if (!item.emotion) item.emotion = "중립";
        
        // 🔄 예전 방식: emotion에서 실제 감정만 추출
        let emotionText = item.emotion;
        if (typeof emotionText === 'string' && emotionText.includes(' ')) {
          // "😊 기쁨" 형태에서 "기쁨"만 추출
          const parts = emotionText.split(' ');
          emotionText = parts[parts.length - 1];
        }
        
        return {
          ...item,
          emotion: emotionText,
          // 🔄 예전 방식: 메타데이터 추가
          hasWebtoonImage: item.hasWebtoonImage || !!item.scene,
          imageType: item.hasWebtoonImage ? '웹툰 장면' : '캐릭터 이미지'
        };
      });

      setWebtoons(validatedWebtoons);
      console.log(`📚 갤러리 로드 완료: ${validatedWebtoons.length}개 웹툰`);
      
      // 🔄 예전 방식: 통계 정보 로깅
      const emotionCounts = {};
      const imageTypeCounts = { '웹툰 장면': 0, '캐릭터 이미지': 0 };
      
      validatedWebtoons.forEach(item => {
        emotionCounts[item.emotion] = (emotionCounts[item.emotion] || 0) + 1;
        imageTypeCounts[item.imageType] = (imageTypeCounts[item.imageType] || 0) + 1;
      });
      
      console.log("📊 감정 분포:", emotionCounts);
      console.log("🎨 이미지 타입:", imageTypeCounts);
      
    } catch (error) {
      console.error("❌ 갤러리 로드 실패:", error);
      setWebtoons([]);
    }
  };

  const handleDeleteConfirm = () => {
    if (!toDelete) return;
    const updated = webtoons.filter((item) => item.id !== toDelete.id);
    setWebtoons(updated);
    localStorage.setItem("webtoons", JSON.stringify(updated));
    // 🔄 예전 방식: 백업 저장소도 업데이트
    localStorage.setItem("webtoonGallery", JSON.stringify(updated));
    setToDelete(null);
    
    console.log(`🗑️ 웹툰 삭제 완료: ${toDelete.id}`);
  };

  // 🔄 예전 방식: 날짜 포맷팅 개선
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

  // 🔄 예전 방식: 필터링 및 정렬 로직 개선
  const displayed = [...webtoons]
    .filter((item) => {
      if (filterEmotion === "전체") return true;
      
      // emotion 필드에서 정확한 매칭 또는 포함 여부 확인
      const itemEmotion = item.emotion || "";
      return itemEmotion === filterEmotion || itemEmotion.includes(filterEmotion);
    })
    .sort((a, b) => (sortOrder === "desc" ? b.id - a.id : a.id - b.id));

  // 🔄 예전 방식: 통계 계산
  const emotionStats = {};
  webtoons.forEach(item => {
    const emotion = item.emotion || "중립";
    emotionStats[emotion] = (emotionStats[emotion] || 0) + 1;
  });

  const clearGallery = () => {
    if (window.confirm('정말로 모든 웹툰을 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.')) {
      localStorage.removeItem('webtoons');
      localStorage.removeItem('webtoonGallery');
      setWebtoons([]);
      console.log('🗑️ 갤러리 전체 삭제 완료');
    }
  };

  return (
    <PageWrapper>
      <h1 style={{ fontSize: "26px", textAlign: "center", marginBottom: "10px" }}>
        📚 나의 감정 웹툰 갤러리
      </h1>
      
      {/* 🔄 예전 방식: 갤러리 통계 표시 */}
      <div style={{ 
        textAlign: "center", 
        marginBottom: "20px",
        color: "#666",
        fontSize: "14px"
      }}>
        <div>총 {webtoons.length}개의 웹툰을 만들었어요!</div>
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

      {/* 필터 & 정렬 & 뷰 모드 */}
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
            padding: "8px 12px",
            backgroundColor: "#eee",
            border: "1px solid #ccc",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          📅 {sortOrder === "desc" ? "최신순" : "오래된순"}
        </button>

        <select
          onChange={(e) => setFilterEmotion(e.target.value)}
          value={filterEmotion}
          style={{
            padding: "8px 12px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            backgroundColor: "#fff",
            cursor: "pointer",
          }}
        >
          <option value="전체">전체 감정 ({webtoons.length})</option>
          {Object.entries(emotionStats).map(([emotion, count]) => (
            <option key={emotion} value={emotion}>
              {emotionEmojis[emotion] || '🙂'} {emotion} ({count})
            </option>
          ))}
        </select>

        {/* 🔄 예전 방식: 뷰 모드 선택 */}
        <button
          onClick={() => setViewMode(viewMode === "card" ? "list" : "card")}
          style={{
            padding: "8px 12px",
            backgroundColor: viewMode === "card" ? "#007bff" : "#eee",
            color: viewMode === "card" ? "#fff" : "#333",
            border: "1px solid #ccc",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          {viewMode === "card" ? "📱 카드뷰" : "📋 리스트뷰"}
        </button>
      </div>

      {/* 액션 버튼들 */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        gap: "12px",
        margin: "0 0 30px 0",
        flexWrap: "wrap",
      }}>
        <button
          onClick={() => navigate('/input')}
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
          ✏️ 새 일기 작성
        </button>

        {webtoons.length >= 7 && (
          <button
            onClick={() => navigate('/weekly')}
            style={{
              padding: "12px 20px",
              fontSize: "14px",
              backgroundColor: "#9c27b0",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(156, 39, 176, 0.3)",
              transition: "transform 0.2s",
            }}
            onMouseOver={(e) => e.target.style.transform = "translateY(-2px)"}
            onMouseOut={(e) => e.target.style.transform = "translateY(0)"}
          >
            📚 주간 웹툰 보기
          </button>
        )}

        <button
          onClick={() => navigate('/stats')}
          style={{
            padding: "12px 20px",
            fontSize: "14px",
            backgroundColor: "#fd7e14",
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            boxShadow: "0 2px 6px rgba(253, 126, 20, 0.3)",
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

      {/* 🔄 예전 방식: 카드 목록 (더 풍부한 정보 표시) */}
      {viewMode === "card" && (
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile
            ? "1fr 1fr"
            : "repeat(auto-fill, minmax(250px, 1fr))",
          gap: "16px",
          justifyContent: "center",
        }}>
          {displayed.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              style={{
                padding: "12px",
                border: "1px solid #ddd",
                borderRadius: "12px",
                backgroundColor: "#fff",
                boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                cursor: "pointer",
                position: "relative",
                transition: "transform 0.2s",
              }}
              onMouseOver={(e) => e.target.style.transform = "translateY(-4px)"}
              onMouseOut={(e) => e.target.style.transform = "translateY(0)"}
            >
              {/* 이미지 */}
              <img
                src={item.image}
                alt="웹툰 썸네일"
                style={{
                  width: "100%",
                  height: "140px",
                  objectFit: "cover",
                  borderRadius: "8px",
                  marginBottom: "10px",
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div style={{ 
                display: 'none', 
                height: "140px", 
                backgroundColor: "#f5f5f5", 
                borderRadius: "8px", 
                alignItems: "center", 
                justifyContent: "center",
                marginBottom: "10px",
                color: "#999"
              }}>
                이미지 로드 실패
              </div>

              {/* 🔄 예전 방식: 메타데이터 표시 */}
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "8px"
              }}>
                <span style={{ fontSize: "12px", color: "#888" }}>
                  {formatDate(item.date)}
                </span>
                <span style={{ 
                  fontSize: "10px", 
                  color: item.hasWebtoonImage ? "#28a745" : "#6c757d",
                  backgroundColor: item.hasWebtoonImage ? "#e8f5e8" : "#f8f9fa",
                  padding: "2px 6px",
                  borderRadius: "4px"
                }}>
                  {item.imageType}
                </span>
              </div>

              {/* 감정 */}
              <div style={{ 
                fontSize: "14px", 
                fontWeight: "bold", 
                marginBottom: "8px",
                color: "#333"
              }}>
                {emotionEmojis[item.emotion] || '🙂'} {item.emotion}
              </div>

              {/* 🔄 예전 방식: 장면 정보 표시 */}
              {item.scene && (
                <div style={{ 
                  fontSize: "12px", 
                  color: "#666",
                  marginBottom: "6px",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden"
                }}>
                  📍 {item.scene}
                </div>
              )}

              {/* 🔄 예전 방식: 대사 표시 */}
              {item.dialogue && (
                <div style={{ 
                  fontSize: "12px", 
                  color: "#666",
                  fontStyle: "italic",
                  marginBottom: "6px",
                  display: "-webkit-box",
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden"
                }}>
                  💬 "{item.dialogue}"
                </div>
              )}

              {/* 🔄 예전 방식: 키워드 태그 */}
              {item.keywords && item.keywords.length > 0 && (
                <div style={{ marginBottom: "8px" }}>
                  {item.keywords.slice(0, 3).map((keyword, idx) => (
                    <span 
                      key={idx} 
                      style={{
                        fontSize: "10px",
                        backgroundColor: "#e9ecef",
                        color: "#495057",
                        padding: "2px 6px",
                        borderRadius: "12px",
                        marginRight: "4px",
                        display: "inline-block",
                        marginBottom: "2px"
                      }}
                    >
                      #{keyword}
                    </span>
                  ))}
                </div>
              )}

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
                  width: "24px",
                  height: "24px",
                  fontSize: "12px",
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

      {/* 🔄 예전 방식: 리스트 뷰 (간단한 이미지만) */}
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
              }}
              onMouseOver={(e) => e.target.style.transform = "translateY(-2px)"}
              onMouseOut={(e) => e.target.style.transform = "translateY(0)"}
            >
              {/* 썸네일 (간단하게) */}
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
              />

              {/* 정보 */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ 
                  display: "flex", 
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "8px"
                }}>
                  <span style={{ 
                    fontWeight: "bold",
                    fontSize: "16px"
                  }}>
                    {emotionEmojis[item.emotion] || '🙂'} {item.emotion}
                  </span>
                  <span style={{ 
                    fontSize: "12px", 
                    color: "#888" 
                  }}>
                    {formatDate(item.date)}
                  </span>
                </div>

                {item.scene && (
                  <div style={{ 
                    fontSize: "14px", 
                    color: "#666",
                    marginBottom: "6px",
                    display: "-webkit-box",
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden"
                  }}>
                    📍 {item.scene}
                  </div>
                )}

                {item.dialogue && (
                  <div style={{ 
                    fontSize: "14px", 
                    color: "#666",
                    fontStyle: "italic",
                    marginBottom: "6px",
                    display: "-webkit-box",
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden"
                  }}>
                    💬 "{item.dialogue}"
                  </div>
                )}

                <div style={{ 
                  fontSize: "13px", 
                  color: "#666",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden"
                }}>
                  {item.summary || item.inputText}
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
                  width: "24px",
                  height: "24px",
                  fontSize: "12px",
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

      {/* 빈 갤러리 메시지 */}
      {webtoons.length === 0 && (
        <div style={{
          textAlign: "center",
          padding: "60px 20px",
          color: "#666"
        }}>
          <div style={{ fontSize: "48px", marginBottom: "20px" }}>📝</div>
          <h3 style={{ marginBottom: "10px" }}>아직 웹툰이 없어요!</h3>
          <p style={{ marginBottom: "30px" }}>첫 번째 일기를 작성해서 웹툰을 만들어보세요</p>
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
      )}

      {/* 필터 결과 없음 */}
      {webtoons.length > 0 && displayed.length === 0 && (
        <div style={{
          textAlign: "center",
          padding: "40px 20px",
          color: "#666"
        }}>
          <div style={{ fontSize: "32px", marginBottom: "15px" }}>
            {emotionEmojis[filterEmotion] || '🔍'}
          </div>
          <h3 style={{ marginBottom: "10px" }}>
            {filterEmotion} 감정의 웹툰이 없어요
          </h3>
          <p style={{ marginBottom: "20px" }}>
            다른 감정으로 필터링하거나 새로운 일기를 작성해보세요
          </p>
          <button
            onClick={() => setFilterEmotion("전체")}
            style={{
              padding: "8px 16px",
              backgroundColor: "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              marginRight: "10px"
            }}
          >
            전체 보기
          </button>
          <button
            onClick={() => navigate('/input')}
            style={{
              padding: "8px 16px",
              backgroundColor: "#28a745",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer"
            }}
          >
            새 일기 작성
          </button>
        </div>
      )}

      {/* 🔄 예전 방식: 상세 모달 개선 */}
      {selectedItem && (
        <div onClick={() => setSelectedItem(null)} style={modalBgStyle}>
          <div
            onClick={(e) => e.stopPropagation()}
            style={getModalBoxStyle(isMobile)}
          >
            <h3 style={{ marginBottom: "15px", display: "flex", alignItems: "center", gap: "8px" }}>
              {emotionEmojis[selectedItem.emotion] || '🙂'} {selectedItem.emotion} 웹툰 상세보기
            </h3>
            
            <img
              src={selectedItem.image}
              alt="웹툰 전체"
              style={{
                width: "100%",
                borderRadius: "8px",
                marginBottom: "15px",
              }}
            />

            <div style={{ marginBottom: "15px", fontSize: "12px", color: "#888" }}>
              📅 {formatDate(selectedItem.date)} • {selectedItem.imageType}
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
                <h4 style={{ fontSize: "14px", marginBottom: "8px", color: "#333" }}>🏷️ 키워드</h4>
                <div>
                  {selectedItem.keywords.map((keyword, idx) => (
                    <span 
                      key={idx} 
                      style={{
                        fontSize: "12px",
                        backgroundColor: "#e9ecef",
                        color: "#495057",
                        padding: "4px 8px",
                        borderRadius: "12px",
                        marginRight: "6px",
                        marginBottom: "4px",
                        display: "inline-block"
                      }}
                    >
                      #{keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "10px",
            }}>
              <a
                href={selectedItem.image}
                download={`webtoon-${selectedItem.id}.png`}
                style={{
                  flex: 1,
                  backgroundColor: "#007bff",
                  color: "#fff",
                  padding: "12px",
                  borderRadius: "8px",
                  textDecoration: "none",
                  textAlign: "center",
                  fontSize: "14px",
                }}
              >
                💾 이미지 저장
              </a>
              <button
                onClick={() => setSelectedItem(null)}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "#6c757d",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 삭제 모달 */}
      {toDelete && (
        <div onClick={() => setToDelete(null)} style={modalBgStyle}>
          <div
            onClick={(e) => e.stopPropagation()}
            style={getModalBoxStyle(isMobile)}
          >
            <h3 style={{ fontSize: "18px" }}>
              <span style={{ marginRight: "6px" }}>❗</span>정말 삭제할까요?
            </h3>
            <p style={{ color: "#555", fontSize: "14px", margin: "16px 0" }}>
              이 웹툰과 함께{" "}
              <strong style={{ color: "#d32f2f" }}>일기 내용도 삭제</strong>
              됩니다 😢
            </p>
            <div style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "8px",
            }}>
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