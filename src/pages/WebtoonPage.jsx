import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import image1 from "../assets/image/image1.png";
import image2 from "../assets/image/image2.png";
import image3 from "../assets/image/image3.png";
import image4 from "../assets/image/image4.png";

import PageWrapper from "../components/PageWrapper"; // ✅ 페이지 감싸기

const WebtoonPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { inputText, emotion, summary } = location.state || {};
  const captureRef = useRef(null);
  const hasSaved = useRef(false);

  const imageList = [image1, image2, image3, image4];
  const selectedImage = useRef(
    imageList[Math.floor(Math.random() * imageList.length)]
  );

  useEffect(() => {
    if (!inputText || !emotion || !summary || hasSaved.current) return;
    hasSaved.current = true;

    const newEntry = {
      id: Date.now(),
      date: new Date().toISOString(),
      inputText,
      emotion,
      summary,
      image: selectedImage.current,
    };

    const prev = JSON.parse(localStorage.getItem("webtoons")) || [];
    localStorage.setItem("webtoons", JSON.stringify([...prev, newEntry]));
  }, [inputText, emotion, summary]);

  if (!inputText || !emotion || !summary) {
    return (
      <PageWrapper>
        <p style={{ textAlign: "center", marginTop: "100px", color: "#888" }}>
          ⚠️ 웹툰을 생성할 수 없습니다. 감정 분석부터 진행해주세요.
        </p>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div
        style={{
          maxWidth: "500px",
          margin: "0 auto",
          padding: "40px 20px",
          fontFamily: "'Apple SD Gothic Neo', sans-serif",
        }}
      >
        <h2 style={{ fontSize: "26px", textAlign: "center" }}>
          🎉 웹툰 생성 완료!
        </h2>
        <p style={{ textAlign: "center", color: "#666", marginBottom: "30px" }}>
          분석된 감정을 기반으로 아래 웹툰이 생성되었어요.
        </p>

        <div
          ref={captureRef}
          style={{
            backgroundColor: "#fff",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            padding: "16px",
          }}
        >
          <img
            src={selectedImage.current}
            alt="웹툰 이미지"
            style={{
              width: "100%",
              maxHeight: "320px",
              objectFit: "contain",
              borderRadius: "12px",
            }}
          />

          <div style={{ marginTop: "16px", fontSize: "14px", color: "#444" }}>
            <p>{emotion}</p>
            <p>
              💬 <em>“{summary}”</em>
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate("/gallery")}
          style={{
            marginTop: "30px",
            display: "block",
            width: "100%",
            padding: "12px",
            fontSize: "16px",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
          }}
        >
          📂 갤러리로 이동하기
        </button>
      </div>
    </PageWrapper>
  );
};

export default WebtoonPage;
