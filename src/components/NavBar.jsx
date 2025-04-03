import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const NavBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  const navItems = [
    { path: "/", label: "오늘 한 컷", emoji: "🏠" },
    { path: "/input", label: "오늘의 이야기", emoji: "📝" },
    { path: "/gallery", label: "웹툰 갤러리", emoji: "📚" },
    { path: "/stats", label: "통계", emoji: "📊" },
    { path: "/custom", label: "커스터마이징", emoji: "🎨" },
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
              onClick={() => navigate(item.path)}
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
    </>
  );
};

export default NavBar;
