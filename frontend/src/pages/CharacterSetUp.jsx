
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageWrapper from "../components/PageWrapper";

const CharacterSetUp = () => {
  const navigate = useNavigate();
  
  const [textDescription, setTextDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCharacters, setGeneratedCharacters] = useState({});
  const [currentGeneratingEmotion, setCurrentGeneratingEmotion] = useState("");
  
  const emotions = ["기쁨", "슬픔", "분노", "불안", "중립"];

  // 텍스트 기반 캐릭터 생성
  const generateCharacter = async () => {
    if (!textDescription.trim()) {
      alert("캐릭터 설명을 입력해주세요!");
      return;
    }

    setIsGenerating(true);
    const generated = {};

    try {
      for (const emotion of emotions) {
        setCurrentGeneratingEmotion(emotion);
        console.log(`🎨 ${emotion} 표정 캐릭터 생성 중...`);
        
        const prompt = `
          웹툰/만화 스타일 캐릭터 전신 일러스트:
          ${textDescription}
          표정: ${emotion} ${getEmotionDescription(emotion)}
          자세: 정면을 보고 서있는 전신 포즈
          배경: 순수한 흰색 배경
          스타일: 귀여운 한국 웹툰 스타일, 깔끔한 라인아트, 파스텔톤
          중요: 동일한 캐릭터의 다른 표정
        `;

        const response = await fetch('/api/generate_character', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: prompt,
            emotion: emotion,
            character_description: textDescription
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('서버 응답:', errorText);
          throw new Error(`서버 에러: ${response.status}`);
        }

        const data = await response.json();
        if (data.url) {
          generated[emotion] = data.url;
          setGeneratedCharacters(prev => ({...prev, [emotion]: data.url}));
        }
        
        // 각 이미지 생성 후 잠시 대기 (rate limit 방지)
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // 로컬스토리지에 저장
      const characterData = {
        description: textDescription,
        images: generated,
        createdAt: new Date().toISOString()
      };
      
      localStorage.setItem("userCharacter", JSON.stringify(characterData));
      setCurrentGeneratingEmotion("");
      alert("캐릭터가 성공적으로 생성되었습니다!");
      
    } catch (error) {
      console.error("캐릭터 생성 실패:", error);
      alert("캐릭터 생성 중 오류가 발생했습니다.");
    } finally {
      setIsGenerating(false);
      setCurrentGeneratingEmotion("");
    }
  };

  const getEmotionDescription = (emotion) => {
    const descriptions = {
      "기쁨": "(활짝 웃는 얼굴, 반달 눈)",
      "슬픔": "(눈물이 맺힌 표정, 처진 눈썹)",
      "분노": "(화난 표정, 찌푸린 미간)",
      "불안": "(불안한 눈빛, 긴장된 표정)",
      "중립": "(평온한 표정)"
    };
    return descriptions[emotion];
  };

  // 이미 캐릭터가 있는지 확인
  const existingCharacter = JSON.parse(localStorage.getItem("userCharacter") || "{}");

  return (
    <PageWrapper>
      <div style={{ maxWidth: "700px", margin: "0 auto", padding: "20px" }}>
        <h1 style={{ textAlign: "center", marginBottom: "10px" }}>
          🎨 나만의 캐릭터 만들기
        </h1>
        <p style={{ textAlign: "center", color: "#666", marginBottom: "30px" }}>
          원하는 캐릭터의 특징을 자세히 설명해주세요
        </p>

        {/* 기존 캐릭터가 있을 때 경고 */}
        {existingCharacter.images && (
          <div style={{
            backgroundColor: "#fff3cd",
            border: "1px solid #ffeaa7",
            padding: "15px",
            borderRadius: "8px",
            marginBottom: "20px",
            textAlign: "center"
          }}>
            <p style={{ margin: 0, color: "#856404" }}>
              ⚠️ 이미 캐릭터가 있습니다. 새로 만들면 기존 캐릭터가 삭제됩니다.
            </p>
          </div>
        )}

        {/* 설명 입력 영역 */}
        <div style={{
          backgroundColor: "#f8f9fa",
          padding: "30px",
          borderRadius: "15px",
          marginBottom: "30px"
        }}>
          <label style={{ 
            display: "block", 
            marginBottom: "15px", 
            fontWeight: "bold",
            fontSize: "18px"
          }}>
            캐릭터 설명
          </label>
          
          <textarea
            value={textDescription}
            onChange={(e) => setTextDescription(e.target.value)}
            placeholder={`예시:\n• 20대 여성, 긴 갈색 머리를 묶은 포니테일\n• 큰 눈과 둥근 얼굴형\n• 분홍색 후드티와 청바지\n• 안경 착용\n• 밝고 활발한 느낌\n\n구체적으로 적을수록 원하는 캐릭터에 가까워집니다!`}
            style={{
              width: "100%",
              height: "250px",
              padding: "15px",
              borderRadius: "10px",
              border: "1px solid #dee2e6",
              fontSize: "16px",
              resize: "vertical",
              fontFamily: "inherit"
            }}
            disabled={isGenerating}
          />
          
          <div style={{ 
            marginTop: "10px", 
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <span style={{ fontSize: "14px", color: "#666" }}>
              {textDescription.length}/500자
            </span>
            <span style={{ fontSize: "14px", color: "#007bff" }}>
              💡 Tip: 성별, 나이, 헤어스타일, 얼굴형, 옷차림 등을 포함해주세요
            </span>
          </div>
        </div>

        {/* 생성 진행 상황 */}
        {isGenerating && (
          <div style={{
            backgroundColor: "#e7f3ff",
            padding: "20px",
            borderRadius: "10px",
            marginBottom: "20px"
          }}>
            <h3 style={{ marginBottom: "15px", textAlign: "center" }}>
              🎨 캐릭터 생성 중...
            </h3>
            <div>
              {emotions.map((emotion) => (
                <div key={emotion} style={{ 
                  marginBottom: "10px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px"
                }}>
                  <span style={{ width: "60px" }}>{emotion}:</span>
                  {generatedCharacters[emotion] ? (
                    <span style={{ color: "#28a745" }}>✅ 완료</span>
                  ) : currentGeneratingEmotion === emotion ? (
                    <span style={{ color: "#ffc107" }}>⏳ 생성 중...</span>
                  ) : (
                    <span style={{ color: "#6c757d" }}>⏸️ 대기 중</span>
                  )}
                </div>
              ))}
            </div>
            <p style={{ 
              marginTop: "15px", 
              textAlign: "center", 
              color: "#666",
              fontSize: "14px"
            }}>
              총 5가지 표정을 생성합니다. 약 10-15초가 소요됩니다.
            </p>
          </div>
        )}

        {/* 생성된 캐릭터 미리보기 */}
        {Object.keys(generatedCharacters).length > 0 && !isGenerating && (
          <div style={{
            backgroundColor: "#f8f9fa",
            padding: "20px",
            borderRadius: "15px",
            marginBottom: "30px"
          }}>
            <h3 style={{ textAlign: "center", marginBottom: "20px" }}>
              생성된 캐릭터
            </h3>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
              gap: "15px"
            }}>
              {Object.entries(generatedCharacters).map(([emotion, url]) => (
                <div key={emotion} style={{
                  textAlign: "center",
                  backgroundColor: "white",
                  padding: "10px",
                  borderRadius: "10px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                }}>
                  <img
                    src={url}
                    alt={`${emotion} 표정`}
                    style={{
                      width: "100%",
                      height: "120px",
                      objectFit: "cover",
                      borderRadius: "8px",
                      marginBottom: "8px"
                    }}
                  />
                  <p style={{ margin: 0, fontSize: "14px", fontWeight: "bold" }}>
                    {emotion}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 버튼 영역 */}
        <div style={{ textAlign: "center" }}>
          {!isGenerating && Object.keys(generatedCharacters).length === emotions.length ? (
            <button
              onClick={() => navigate("/")}
              style={{
                padding: "15px 40px",
                fontSize: "18px",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer"
              }}
            >
              일기 쓰러 가기
            </button>
          ) : (
            <>
              <button
                onClick={generateCharacter}
                disabled={!textDescription.trim() || isGenerating}
                style={{
                  padding: "15px 30px",
                  fontSize: "18px",
                  backgroundColor: (!textDescription.trim() || isGenerating) ? "#6c757d" : "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  cursor: (!textDescription.trim() || isGenerating) ? "not-allowed" : "pointer",
                  marginRight: "10px"
                }}
              >
                {isGenerating ? "생성 중..." : "캐릭터 생성하기"}
              </button>

              <button
                onClick={() => navigate("/")}
                disabled={isGenerating}
                style={{
                  padding: "15px 30px",
                  fontSize: "18px",
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  cursor: "pointer"
                }}
              >
                나중에 하기
              </button>
            </>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};

export default CharacterSetUp;