import { Outlet, useLocation } from "react-router-dom";
import NavBar from "./NavBar";

const LayoutWithTab = () => {
  const location = useLocation();

  // 🔧 로그인/회원가입 페이지에서만 탭바 숨김 (홈에서는 표시)
  const hideNavOn = ["/login", "/sign-up"];
  const shouldHideNav = hideNavOn.includes(location.pathname);

  return (
    <div style={{ paddingBottom: "70px" }}>
      <Outlet />
      {!shouldHideNav && <NavBar />}
    </div>
  );
};

export default LayoutWithTab;