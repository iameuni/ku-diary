// components/LayoutWithTab.jsx
import { Outlet, useLocation } from "react-router-dom";
import NavBar from "./NavBar";

const LayoutWithTab = () => {
  const location = useLocation();

  // 홈에서는 탭바 안 보이도록 설정 (필요 없으면 제거 가능)
  const hideNavOn = ["/", "/login", "/sign-up"];
  const shouldHideNav = hideNavOn.includes(location.pathname);

  return (
    <div style={{ paddingBottom: "70px" }}>
      <Outlet />
      {!shouldHideNav && <NavBar />}
    </div>
  );
};

export default LayoutWithTab;