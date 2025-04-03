// components/PageWrapper.jsx
import { useEffect, useState } from "react";

const PageWrapper = ({ children }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      style={{
        padding: "30px 20px",
        paddingTop: isMobile ? "30px" : "100px",
        paddingBottom: isMobile ? "100px" : "50px",
        maxWidth: "800px",
        margin: "0 auto",
        fontFamily: "'Apple SD Gothic Neo', sans-serif",
      }}
    >
      {children}
    </div>
  );
};

export default PageWrapper;
