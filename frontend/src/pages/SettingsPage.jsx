import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
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

const SettingsPage = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDataModal, setShowDataModal] = useState(false);
  const [userStats, setUserStats] = useState({ webtoons: 0, totalDays: 0 });

  useEffect(() => {
    // 사용자 데이터 통계 계산
    const webtoons = JSON.parse(localStorage.getItem("webtoons") || "[]");
    const firstEntry = webtoons[webtoons.length - 1]?.date;
    const totalDays = firstEntry ? 
      Math.ceil((new Date() - new Date(firstEntry)) / (1000 * 60 * 60 * 24)) : 0;
    
    setUserStats({
      webtoons: webtoons.length,
      totalDays: Math.max(1, totalDays)
    });
  }, []);

  // 로그아웃 함수
  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("userId");
      console.log("✅ 로그아웃 완료");
      navigate("/");
      setShowLogoutModal(false);
    } catch (error) {
      console.error("❌ 로그아웃 오류:", error);
      alert("로그아웃 중 오류가 발생했습니다.");
    }
  };

  // 데이터 전체 삭제
  const handleClearData = () => {
    localStorage.clear();
    setUserStats({ webtoons: 0, totalDays: 0 });
    setShowDataModal(false);
    alert("모든 데이터가 삭제되었습니다.");
  };

  return (
    <PageWrapper>
      <div style={{
        maxWidth: "600px",
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
            ⚙️ 설정
          </h1>
          <p style={{ color: "#666", fontSize: "14px" }}>
            앱 설정과 계정 관리를 해보세요
          </p>
        </div>

        {/* 사용자 정보 카드 */}
        <div style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderRadius: "16px",
          padding: "25px",
          marginBottom: "30px",
          color: "#fff",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "48px", marginBottom: "15px" }}>👤</div>
          <h3 style={{ marginBottom: "10px", fontSize: "18px" }}>내 웹툰 활동</h3>
          <div style={{ 
            display: "flex", 
            justifyContent: "space-around",
            marginTop: "20px"
          }}>
            <div>
              <div style={{ fontSize: "24px", fontWeight: "bold" }}>
                {userStats.webtoons}
              </div>
              <div style={{ fontSize: "12px", opacity: 0.9 }}>
                만든 웹툰
              </div>
            </div>
            <div>
              <div style={{ fontSize: "24px", fontWeight: "bold" }}>
                {userStats.totalDays}
              </div>
              <div style={{ fontSize: "12px", opacity: 0.9 }}>
                함께한 날
              </div>
            </div>
            <div>
              <div style={{ fontSize: "24px", fontWeight: "bold" }}>
                {userStats.webtoons > 0 ? (userStats.webtoons / userStats.totalDays).toFixed(1) : "0"}
              </div>
              <div style={{ fontSize: "12px", opacity: 0.9 }}>
                일평균
              </div>
            </div>
          </div>
        </div>

        {/* 설정 메뉴들 */}
        <div style={{ marginBottom: "40px" }}>
          
          {/* 캐릭터 설정 */}
          <div style={menuItemStyle} onClick={() => navigate('/character-setup')}>
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <div style={{ 
                width: "50px", 
                height: "50px", 
                borderRadius: "50%", 
                backgroundColor: "#e3f2fd",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px"
              }}>
                🎨
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
                  캐릭터 설정
                </div>
                <div style={{ fontSize: "13px", color: "#666" }}>
                  나만의 웹툰 캐릭터를 만들어보세요
                </div>
              </div>
              <div style={{ color: "#666" }}>▶</div>
            </div>
          </div>

          {/* 갤러리 관리 */}
          <div style={menuItemStyle} onClick={() => navigate('/gallery')}>
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <div style={{ 
                width: "50px", 
                height: "50px", 
                borderRadius: "50%", 
                backgroundColor: "#f3e5f5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px"
              }}>
                📚
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
                  웹툰 갤러리
                </div>
                <div style={{ fontSize: "13px", color: "#666" }}>
                  내가 만든 웹툰들을 확인해보세요
                </div>
              </div>
              <div style={{ color: "#666" }}>▶</div>
            </div>
          </div>

          {/* 감정 통계 */}
          <div style={menuItemStyle} onClick={() => navigate('/stats')}>
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <div style={{ 
                width: "50px", 
                height: "50px", 
                borderRadius: "50%", 
                backgroundColor: "#fff3e0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px"
              }}>
                📊
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
                  감정 통계
                </div>
                <div style={{ fontSize: "13px", color: "#666" }}>
                  나의 감정 패턴을 분석해보세요
                </div>
              </div>
              <div style={{ color: "#666" }}>▶</div>
            </div>
          </div>

          {/* 주간 웹툰 */}
          {userStats.webtoons >= 7 && (
            <div style={menuItemStyle} onClick={() => navigate('/weekly')}>
              <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                <div style={{ 
                  width: "50px", 
                  height: "50px", 
                  borderRadius: "50%", 
                  backgroundColor: "#e8f5e8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px"
                }}>
                  📖
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
                    주간 스토리보드
                  </div>
                  <div style={{ fontSize: "13px", color: "#666" }}>
                    일주일간의 감정 여정을 확인해보세요
                  </div>
                </div>
                <div style={{ color: "#666" }}>▶</div>
              </div>
            </div>
          )}
        </div>

        {/* 위험한 액션들 */}
        <div style={{ marginBottom: "30px" }}>
          <h3 style={{ 
            fontSize: "16px", 
            marginBottom: "15px",
            color: "#666",
            borderBottom: "1px solid #eee",
            paddingBottom: "8px"
          }}>
            데이터 관리
          </h3>

          {/* 데이터 전체 삭제 */}
          <div 
            style={{
              ...menuItemStyle,
              borderColor: "#ffebee"
            }} 
            onClick={() => setShowDataModal(true)}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <div style={{ 
                width: "50px", 
                height: "50px", 
                borderRadius: "50%", 
                backgroundColor: "#ffebee",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px"
              }}>
                🗑️
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: "bold", marginBottom: "4px", color: "#d32f2f" }}>
                  모든 데이터 삭제
                </div>
                <div style={{ fontSize: "13px", color: "#666" }}>
                  웹툰, 캐릭터 등 모든 데이터를 삭제합니다
                </div>
              </div>
              <div style={{ color: "#d32f2f" }}>⚠️</div>
            </div>
          </div>
        </div>

        {/* 계정 관리 */}
        <div style={{ marginBottom: "40px" }}>
          <h3 style={{ 
            fontSize: "16px", 
            marginBottom: "15px",
            color: "#666",
            borderBottom: "1px solid #eee",
            paddingBottom: "8px"
          }}>
            계정
          </h3>

          {/* 로그아웃 버튼 */}
          <div 
            style={{
              background: "#fff",
              border: "2px solid #dc3545",
              borderRadius: "12px",
              padding: "20px",
              cursor: "pointer",
              transition: "all 0.2s",
              marginBottom: "15px"
            }}
            onClick={() => setShowLogoutModal(true)}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = "#dc3545";
              e.target.style.color = "#fff";
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = "#fff";
              e.target.style.color = "#333";
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <div style={{ 
                width: "50px", 
                height: "50px", 
                borderRadius: "50%", 
                backgroundColor: "rgba(220, 53, 69, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px"
              }}>
                👋
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
                  로그아웃
                </div>
                <div style={{ fontSize: "13px", opacity: 0.8 }}>
                  현재 계정에서 로그아웃합니다
                </div>
              </div>
              <div style={{ fontSize: "20px" }}>→</div>
            </div>
          </div>
        </div>

        {/* 하단 홈 버튼 */}
        <div style={{ textAlign: "center" }}>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: "12px 30px",
              backgroundColor: "#6c757d",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              fontSize: "14px"
            }}
          >
            🏠 홈으로 돌아가기
          </button>
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

        {/* 데이터 삭제 확인 모달 */}
        {showDataModal && (
          <div style={modalOverlayStyle} onClick={() => setShowDataModal(false)}>
            <div style={modalBoxStyle} onClick={(e) => e.stopPropagation()}>
              <div style={{ fontSize: "48px", marginBottom: "20px" }}>⚠️</div>
              <h3 style={{ 
                fontSize: "18px", 
                marginBottom: "10px",
                color: "#d32f2f"
              }}>
                정말 모든 데이터를 삭제하시겠어요?
              </h3>
              <p style={{ 
                fontSize: "14px", 
                color: "#666", 
                marginBottom: "25px",
                lineHeight: "1.4"
              }}>
                <strong style={{ color: "#d32f2f" }}>이 작업은 되돌릴 수 없습니다!</strong><br/>
                웹툰 {userStats.webtoons}개와 모든 캐릭터 데이터가 사라져요.
              </p>
              <div style={{ 
                display: "flex", 
                gap: "10px",
                justifyContent: "center"
              }}>
                <button
                  onClick={handleClearData}
                  style={{
                    backgroundColor: "#d32f2f",
                    color: "#fff",
                    border: "none",
                    padding: "12px 20px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "bold"
                  }}
                >
                  네, 삭제합니다
                </button>
                <button
                  onClick={() => setShowDataModal(false)}
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
      </div>
    </PageWrapper>
  );
};

// 스타일 정의
const menuItemStyle = {
  background: "#fff",
  border: "1px solid #eee",
  borderRadius: "12px",
  padding: "15px",
  cursor: "pointer",
  transition: "all 0.2s",
  marginBottom: "12px",
  boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
};

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

const modalBoxStyle = {
  backgroundColor: "#fff",
  padding: "30px",
  borderRadius: "12px",
  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
  textAlign: "center",
  maxWidth: "320px",
  width: "90%",
};

export default SettingsPage;