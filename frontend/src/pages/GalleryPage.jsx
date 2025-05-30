// GalleryPage.jsx
import { useEffect, useState } from "react";
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
  const [webtoons, setWebtoons] = useState([]);
  const [sortOrder, setSortOrder] = useState("desc");
  const [filterEmotion, setFilterEmotion] = useState("전체");
  const [selectedItem, setSelectedItem] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("webtoons")) || [];
    setWebtoons(saved);
  }, []);

  const handleDeleteConfirm = () => {
    if (!toDelete) return;
    const updated = webtoons.filter((item) => item.id !== toDelete.id);
    setWebtoons(updated);
    localStorage.setItem("webtoons", JSON.stringify(updated));
    setToDelete(null);
  };

  const formatDate = (iso) => {
    const date = new Date(iso);
    const today = new Date().toISOString().split("T")[0];
    const dateStr = date.toISOString().split("T")[0];
    const time = date.toTimeString().slice(0, 5);
    return dateStr === today ? `오늘 (${time})` : `${dateStr} ${time}`;
  };

  const displayed = [...webtoons]
    .filter((item) =>
      filterEmotion === "전체" ? true : item.emotion?.includes(filterEmotion)
    )
    .sort((a, b) => (sortOrder === "desc" ? b.id - a.id : a.id - b.id));

  return (
    <PageWrapper>
      <h1
        style={{ fontSize: "26px", textAlign: "center", marginBottom: "0px" }}
      >
        📚 나의 감정 웹툰 갤러리
      </h1>

      {/* 필터 & 정렬 */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "12px",
          margin: "20px 0",
          flexWrap: "wrap",
          marginBottom: "30px",
        }}
      >
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
          <option value="전체">전체 감정</option>
          <option value="기쁨">기쁨</option>
          <option value="슬픔">슬픔</option>
          <option value="분노">분노</option>
          <option value="불안">불안</option>
          <option value="중립">중립</option>
        </select>
      </div>

      {/* 카드 목록 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile
            ? "1fr 1fr"
            : "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "16px",
          justifyContent: "center",
        }}
      >
        {displayed.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedItem(item)}
            style={{
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "12px",
              backgroundColor: "#fff",
              boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
              cursor: "pointer",
              position: "relative",
              transition: "transform 0.2s",
            }}
          >
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
            />
            <p style={{ fontSize: "12px", color: "#888" }}>
              {formatDate(item.date)}
            </p>
            <p style={{ fontSize: "12px", color: "#444" }}>{item.emotion}</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setToDelete(item);
              }}
              style={{
                position: "absolute",
                top: "6px",
                right: "6px",
                background: "none",
                border: "none",
                fontSize: "14px",
                color: "#888",
                cursor: "pointer",
              }}
            >
              ✖
            </button>
          </div>
        ))}
      </div>

      {/* 상세 모달 */}
      {selectedItem && (
        <div onClick={() => setSelectedItem(null)} style={modalBgStyle}>
          <div
            onClick={(e) => e.stopPropagation()}
            style={getModalBoxStyle(isMobile)}
          >
            <h3 style={{ marginBottom: "10px" }}>📖 상세보기</h3>
            <img
              src={selectedItem.image}
              alt="웹툰 전체"
              style={{
                width: "100%",
                borderRadius: "8px",
                marginBottom: "12px",
              }}
            />
            <p style={{ fontSize: "10px", color: "#888" }}>
              {formatDate(selectedItem.date)}
            </p>
            <div style={{ marginBottom: "10px" }}>{selectedItem.emotion}</div>
            <div style={{ marginBottom: "30px" }}>
              💬 {selectedItem.inputText}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "10px",
              }}
            >
              <a
                href={selectedItem.image}
                download={`webtoon-${selectedItem.id}.png`}
                style={{
                  flex: 1,
                  backgroundColor: "#007bff",
                  color: "#fff",
                  padding: "10px",
                  borderRadius: "8px",
                  textDecoration: "none",
                  textAlign: "center",
                  fontSize: "14px",
                }}
              >
                💾 저장
              </a>
              <button
                onClick={() => setSelectedItem(null)}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "#ccc",
                  color: "#333",
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
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "8px",
              }}
            >
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
  maxWidth: isMobile ? "320px" : "420px",
  maxHeight: "90vh",
  overflowY: "auto",
  boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
});

export default GalleryPage;
