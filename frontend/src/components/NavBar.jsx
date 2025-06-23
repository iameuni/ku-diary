import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

const NavBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 로그아웃 함수
  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("userId");
      localStorage.clear(); // 모든 localStorage 데이터 삭제 (선택사항)
      console.log("✅ 로그아웃 완료");
      navigate("/");
      setShowLogoutModal(false);
    } catch (error) {
      console.error("❌ 로그아웃 오류:", error);
      alert("로그아웃 중 오류가 발생했습니다.");
    }
  };

  // 설정 메뉴 클릭 처리
  const handleSettingsClick = () => {
    if (location.pathname === "/settings") {
      // 이미 설정 페이지에 있으면 로그아웃 모달 표시
      setShowLogoutModal(true);
    } else {
      // 설정 페이지로 이동
      navigate("/settings");
    }
  };

  // 네비게이션 바 스타일
  const navStyle = {
    position: "fixed",
    [isMobile ? "bottom" : "top"]: 0,
    left: 0,
    right: 0,
    height: "70px",
    backgroundColor: "#f5f5f5",
    borderTop: isMobile ? "1px solid #ddd" : "none",
    borderBottom: isMobile ? "none" : "1px solid #ddd",
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    fontFamily: "'Apple SD Gothic Neo', sans-serif",
    zIndex: 1000,
  };

  // 네비게이션 아이템 스타일
  const navItemStyle = (active) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: active ? "#007bff" : "#888",
    fontWeight: active ? "bold" : "normal",
    transform: active ? "scale(1.05)" : "none",
    fontSize: "13px",
    width: "100%",
    padding: "10px 0",
    cursor: "pointer",
    transition: "all 0.2s ease",
    borderTop: isMobile && active ? "3px solid #007bff" : "none",
    borderBottom: !isMobile && active ? "3px solid #007bff" : "none",
  });

  // 모달 오버레이 스타일
  const modalOverlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  };

  // 모달 박스 스타일
  const modalBoxStyle = {
    backgroundColor: "#fff",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
    textAlign: "center",
    maxWidth: "320px",
    width: "90%",
  };

  const navItems = [
    { path: "/", label: "홈", emoji: "🏠" },
    { path: "/input", label: "일기", emoji: "📝" },
    { path: "/gallery", label: "갤러리", emoji: "📚" },
    { path: "/stats", label: "통계", emoji: "📊" },
    { path: "/character-setup", label: "캐릭터", emoji: "🎨" },
    { 
      path: "/settings", 
      label: "설정", 
      emoji: "⚙️",
      onClick: handleSettingsClick // 특별한 클릭 핸들러
    },
  ];

  return (
    <>
      {/* 네비게이션 바 */}
      <div style={navStyle}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <div
              key={item.path}
              style={navItemStyle(isActive)}
              onClick={item.onClick || (() => navigate(item.path))}
            >
              {isActive ? (
                <>
                  <span style={{ fontSize: "20px" }}>{item.emoji}</span>
                  <span style={{ marginTop: "4px" }}>{item.label}</span>
                </>
              ) : (
                <span style={{ fontSize: "13px" }}>{item.label}</span>
              )}
            </div>
          );
        })}
      </div>

      {/* 로그아웃 확인 모달 */}
      {showLogoutModal && (
        <div style={modalOverlayStyle} onClick={() => setShowLogoutModal(false)}>
          <div style={modalBoxStyle} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: "48px", marginBottom: "20px" }}>👋</div>
            <h3 style={{ 
              fontSize: "18px", 
              marginBottom: "10px",
              color: "#333"
            }}>
              정말 로그아웃 하시겠어요?
            </h3>
            <p style={{ 
              fontSize: "14px", 
              color: "#666", 
              marginBottom: "25px",
              lineHeight: "1.4"
            }}>
              로그아웃하면 다시 로그인해야 해요.<br/>
              웹툰 데이터는 안전하게 보관됩니다! 😊
            </p>
            <div style={{ 
              display: "flex", 
              gap: "10px",
              justifyContent: "center"
            }}>
              <button
                onClick={handleLogout}
                style={{
                  backgroundColor: "#dc3545",
                  color: "#fff",
                  border: "none",
                  padding: "12px 20px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "bold"
                }}
              >
                네, 로그아웃
              </button>
              <button
                onClick={() => setShowLogoutModal(false)}
                style={{
                  backgroundColor: "#6c757d",
                  color: "#fff",
                  border: "none",
                  padding: "12px 20px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "14px"
                }}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NavBar;