// EmotionInput.jsx - 예전 방식의 장점들 적용
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../components/PageWrapper';

const EmotionInput = () => {
  const navigate = useNavigate();
  const [diaryText, setDiaryText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false); // 예전 방식: isGenerating -> isAnalyzing
  const [shouldNavigate, setShouldNavigate] = useState(false); // 예전 방식: 네비게이션 제어
  const [analysisResult, setAnalysisResult] = useState(null); // 예전 방식: 결과 저장
  const [currentStep, setCurrentStep] = useState(''); // 예전 방식: 단계별 표시
  const [userCharacter, setUserCharacter] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔄 예전 방식: useEffect로 네비게이션 처리
  useEffect(() => {
    if (shouldNavigate && analysisResult) {
      navigate('/webtoon', { 
        state: { 
          inputText: diaryText,
          emotion: analysisResult.analysis?.emotion || "평온",
          summary: analysisResult.analysis?.summary || diaryText,
          cuts: {
            cut1: analysisResult.story?.panels?.[0]?.scene || "오늘의 한 장면",
            bubble1: analysisResult.story?.panels?.[0]?.dialogue || "...",
            scene: analysisResult.story?.panels?.[0]?.scene || "오늘의 한 장면", 
            dialogue: analysisResult.story?.panels?.[0]?.dialogue || "...",
            mood: analysisResult.analysis?.emotion || "평온",
            image_url: analysisResult.story?.panels?.[0]?.image_url
          }
        } 
      });
    }
  }, [shouldNavigate, analysisResult, navigate, diaryText]);

  // 🔄 예전 방식: 캐릭터 데이터 로드
  const loadCharacterData = () => {
    try {
      const savedCharacter = localStorage.getItem('userCharacter');
      console.log('🔍 localStorage 원본:', savedCharacter);
      
      if (savedCharacter) {
        const characterInfo = JSON.parse(savedCharacter);
        console.log('📋 파싱된 캐릭터 정보:', characterInfo);
        console.log('🖼️ 캐릭터 이미지들:', characterInfo.images);
        console.log('📝 캐릭터 설명:', characterInfo.description);
        
        setUserCharacter(characterInfo);
        console.log('✅ 캐릭터 데이터 설정 완료');
      } else {
        console.log('❌ 저장된 캐릭터가 없습니다.');
      }
    } catch (error) {
      console.error('❌ 캐릭터 데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCharacterData();
  }, []);

  // 🔄 예전 방식: 갤러리 저장 로직
  const saveToGallery = (analysisData, diaryText) => {
    try {
      // 감정 이모지 매핑 (예전 방식)
      const emotionEmojis = {
        '기쁨': '😊',
        '슬픔': '😢',
        '분노': '😡',
        '불안': '😰',
        '평온': '😌',
        '중립': '🙂'
      };

      // 웹툰 이미지 또는 대체 이미지 결정
      let imageUrl = analysisData.story?.panels?.[0]?.image_url;
      
      // 웹툰 이미지가 없으면 캐릭터 이미지 사용
      if (!imageUrl && userCharacter && userCharacter.images) {
        const emotion = analysisData.analysis.emotion;
        imageUrl = userCharacter.images[emotion] || 
                  userCharacter.images['중립'] || 
                  Object.values(userCharacter.images)[0];
        console.log('📸 웹툰 이미지 없음 - 캐릭터 이미지 사용:', emotion);
      }
      
      // 예전 방식: 기존 갤러리 구조에 맞춘 데이터 생성
      const webtoonEntry = {
        id: Date.now(),
        date: new Date().toISOString(),
        emotion: `${emotionEmojis[analysisData.analysis.emotion] || '🙂'} ${analysisData.analysis.emotion}`,
        image: imageUrl,
        inputText: diaryText,
        scene: analysisData.story?.panels?.[0]?.scene || '',
        dialogue: analysisData.story?.panels?.[0]?.dialogue || '',
        summary: analysisData.analysis.summary,
        keywords: analysisData.analysis.keywords,
        emotion_intensity: analysisData.analysis.emotion_intensity,
        hasWebtoonImage: !!analysisData.story?.panels?.[0]?.image_url
      };

      const existingGallery = JSON.parse(localStorage.getItem('webtoons') || '[]');
      const updatedGallery = [webtoonEntry, ...existingGallery];
      const limitedGallery = updatedGallery.slice(0, 50);
      
      localStorage.setItem('webtoons', JSON.stringify(limitedGallery));
      
      console.log('🖼️ 기존 갤러리에 웹툰 저장 완료:', webtoonEntry.id);
      console.log('🎨 이미지 타입:', webtoonEntry.hasWebtoonImage ? '웹툰 장면' : '캐릭터 이미지');
    } catch (error) {
      console.error('❌ 갤러리 저장 실패:', error);
    }
  };

  // 🔑 예전 방식: 메인 분석 함수 (캐릭터 처리 로직 개선)
  const analyzeDiary = async () => {
    if (!diaryText.trim()) {
      alert('일기를 입력해주세요!');
      return;
    }

    // 예전 방식: 캐릭터 상태 확인
    const hasCharacter = userCharacter && userCharacter.images;
    
    console.log('🎭 시작 - 캐릭터 유무 확인:');
    console.log('- userCharacter:', userCharacter);
    console.log('- userCharacter.images:', userCharacter?.images);
    console.log('- hasCharacter:', hasCharacter);

    // 🔄 예전 방식: 캐릭터가 없으면 선택권 제공
    if (!hasCharacter) {
      console.log('⚠️ 캐릭터 없음 - 기본 웹툰 생성');
      const goToCharacterSetup = window.confirm(
        '나만의 캐릭터가 설정되지 않았습니다.\n캐릭터를 먼저 만들어보시겠어요?\n\n캐릭터 없이도 웹툰을 만들 수 있지만, 나만의 캐릭터로 만들면 더 재미있어요!'
      );
      if (goToCharacterSetup) {
        navigate('/character-setup');
        return;
      }
    } else {
      console.log('✅ 캐릭터 있음 - 웹툰 장면 이미지 생성');
    }

    setIsAnalyzing(true);
    setCurrentStep('감정 분석 중...');
    
    try {
      // 🔑 예전 방식: API 엔드포인트 선택
      const apiEndpoint = hasCharacter 
        ? '/api/diary/analyze_with_webtoon_image'  // 캐릭터 + 장면 이미지 생성
        : '/api/diary/analyze_with_webtoon';       // 텍스트 스토리만

      // 🔑 예전 방식: 캐릭터 정보 구조화 (핵심!)
      const requestBody = {
        text: diaryText,
        ...(hasCharacter && { 
          character_info: {
            description: userCharacter.description,
            base_images: userCharacter.images  // 🔑 참고용 캐릭터 이미지들 (예전 방식)
          },
          user_id: localStorage.getItem('userId') || 'anonymous'
        })
      };

      console.log('📞 API 호출 정보:');
      console.log('- 엔드포인트:', apiEndpoint);
      console.log('- 요청 본문:', requestBody);
      console.log('- 캐릭터 정보 포함 여부:', hasCharacter);

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setCurrentStep(hasCharacter ? '웹툰 장면 이미지 생성 중...' : '웹툰 스토리 생성 중...');
      
      const data = await response.json();
      console.log('분석 결과:', data);
      
      // 결과 검증
      if (!data.analysis || !data.story) {
        throw new Error('분석 결과가 올바르지 않습니다.');
      }
      
      setCurrentStep('완료! 결과 페이지로 이동 중...');
      
      // 예전 방식: 분석 결과 저장
      setAnalysisResult(data);
      
      // 예전 방식: 웹툰 갤러리에 저장
      saveToGallery(data, diaryText);
      
      // 예전 방식: 로컬 스토리지에 저장
      localStorage.setItem('lastAnalysis', JSON.stringify({
        ...data,
        date: new Date().toISOString()
      }));
      
      // 예전 방식: 잠시 대기 후 네비게이션 트리거
      setTimeout(() => {
        setShouldNavigate(true);
      }, 500);
      
    } catch (error) {
      console.error('Error:', error);
      setCurrentStep('');
      
      // 예전 방식: 에러 처리
      if (error.message.includes('500')) {
        alert('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      } else if (error.message.includes('401') || error.message.includes('402')) {
        alert('API 키 또는 크레딧 문제가 발생했습니다. 관리자에게 문의하세요.');
      } else {
        alert(`분석 중 오류가 발생했습니다: ${error.message}`);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 예전 방식: 변수들
  const characterCount = diaryText.length;
  const maxCharacters = 1000;
  const hasCharacter = userCharacter && userCharacter.images;
  const availableEmotions = hasCharacter ? Object.keys(userCharacter.images) : [];

  const emotionEmojis = {
    '기쁨': '😊',
    '슬픔': '😢',
    '분노': '😡',
    '불안': '😰',
    '평온': '😌',
    '중립': '🙂'
  };

  return (
    <PageWrapper>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        <h1 style={{ fontSize: '28px', textAlign: 'center', marginBottom: '10px' }}>
          📝 오늘의 일기
        </h1>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>
          오늘 하루는 어떠셨나요? 자유롭게 작성해주세요
        </p>

        {/* 🔄 예전 방식: 캐릭터 상태 표시 개선 */}
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '20px',
          borderRadius: '15px',
          marginBottom: '30px'
        }}>
          {hasCharacter ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginBottom: '15px'
              }}>
                <span style={{ fontSize: '18px', fontWeight: 'bold' }}>✨ 나만의 캐릭터로 웹툰 생성</span>
                <button
                  onClick={() => navigate('/character-setup')}
                  style={{
                    padding: '4px 12px',
                    fontSize: '12px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  캐릭터 변경
                </button>
              </div>
              
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '8px',
                marginBottom: '10px'
              }}>
                {availableEmotions.slice(0, 4).map(emotion => (
                  <img 
                    key={emotion}
                    src={userCharacter.images[emotion]}
                    alt={emotion}
                    style={{
                      width: '40px',
                      height: '40px',
                      objectFit: 'cover',
                      borderRadius: '50%',
                      border: '2px solid #fff',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                    title={`${emotion} 표정`}
                  />
                ))}
                {availableEmotions.length > 4 && (
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: '#e9ecef',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }} title={`총 ${availableEmotions.length}가지 표정`}>
                    +{availableEmotions.length - 4}
                  </span>
                )}
              </div>
              <p style={{ 
                fontSize: '14px', 
                color: '#6c757d',
                margin: 0
              }}>
                총 {availableEmotions.length}가지 표정으로 감정에 맞는 웹툰 생성
              </p>
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>💭</div>
              <h4 style={{ marginBottom: '10px', color: '#495057' }}>기본 웹툰으로 생성됩니다</h4>
              <p style={{ color: '#6c757d', marginBottom: '20px' }}>
                캐릭터를 만들면 일관된 모습의 개인화된 웹툰을 볼 수 있어요
              </p>
              <button
                onClick={() => navigate('/character-setup')}
                style={{
                  padding: '12px 24px',
                  fontSize: '16px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                나만의 캐릭터 만들기
              </button>
            </div>
          )}
        </div>

        {/* 일기 작성 영역 */}
        <div style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '15px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          marginBottom: '30px'
        }}>
          <label style={{
            display: 'block',
            marginBottom: '15px',
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#333'
          }}>
            오늘 있었던 일, 느낀 감정들을 자유롭게 적어주세요... 예시:
          </label>
          
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '15px',
            fontSize: '14px',
            color: '#666',
            lineHeight: '1.6'
          }}>
            <p style={{ margin: '0 0 10px 0' }}>💡 <strong>작성 팁:</strong></p>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li>오늘 친구와 카페에서 만나서 즐거운 시간을 보냈다</li>
              <li>업무가 많아서 스트레스를 받았지만 동료들의 도움으로 잘 마쳤다</li>
              <li>혼자 영화를 보며 여유로운 시간을 가졌다</li>
            </ul>
          </div>

          <textarea
            value={diaryText}
            onChange={(e) => setDiaryText(e.target.value)}
            placeholder="오늘 있었던 일, 느낀 감정들을 자유롭게 적어주세요...&#10;&#10;예시:&#10;- 오늘 친구와 카페에서 만나서 오랜만에 즐거운 시간을 보냈다&#10;- 업무가 많아서 스트레스를 받았지만 동료들의 도움으로 잘 마무리했다&#10;- 혼자 영화를 보며 여유로운 시간을 가졌다"
            style={{
              width: '100%',
              height: '300px',
              padding: '20px',
              border: '2px solid #e9ecef',
              borderRadius: '10px',
              fontSize: '16px',
              lineHeight: '1.6',
              resize: 'vertical',
              fontFamily: 'inherit',
              boxSizing: 'border-box'
            }}
            disabled={isAnalyzing}
            maxLength={maxCharacters}
          />
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '15px'
          }}>
            <span style={{ 
              fontSize: '14px', 
              color: characterCount > maxCharacters * 0.9 ? '#dc3545' : '#666'
            }}>
              {characterCount}/{maxCharacters}자
            </span>
            <span style={{ fontSize: '14px', color: '#007bff' }}>
              💡 구체적으로 적을수록 더 정확한 감정 분석이 가능해요
            </span>
          </div>
        </div>

        {/* 🔄 예전 방식: 웹툰 생성 버튼 */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={analyzeDiary}
            disabled={!diaryText.trim() || isAnalyzing || characterCount > maxCharacters}
            style={{
              padding: '15px 40px',
              fontSize: '18px',
              backgroundColor: (!diaryText.trim() || isAnalyzing || characterCount > maxCharacters) ? '#6c757d' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: (!diaryText.trim() || isAnalyzing || characterCount > maxCharacters) ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(40, 167, 69, 0.3)',
              transition: 'all 0.2s'
            }}
          >
            {isAnalyzing ? '생성 중...' : (hasCharacter ? '나만의 캐릭터 웹툰 만들기' : '감정 분석 & 웹툰 생성하기')}
          </button>
        </div>

        {/* 🔄 예전 방식: 로딩 섹션 */}
        {isAnalyzing && (
          <div style={{
            marginTop: '30px',
            padding: '30px',
            backgroundColor: '#f8f9fa',
            borderRadius: '15px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              border: '4px solid #e9ecef',
              borderTop: '4px solid #007bff',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px auto'
            }}></div>
            <h3>AI가 {hasCharacter ? '나만의 캐릭터로 웹툰을' : '웹툰을'} 만들고 있습니다! ✨</h3>
            <p style={{ fontSize: '16px', color: '#007bff', fontWeight: 'bold' }}>{currentStep}</p>
            <div style={{ margin: '20px 0' }}>
              <p>📖 일기 내용 분석</p>
              <p>😊 감정 상태 파악</p>
              <p>🎨 웹툰 스토리 생성</p>
              {hasCharacter && <p>🖼️ 웹툰 장면 이미지 생성</p>}
              <p>✨ 결과 정리</p>
            </div>
            <p style={{ fontSize: '14px', color: '#666' }}>
              {hasCharacter ? '장면 이미지 생성으로 인해 30-60초 정도 소요됩니다.' : '평균 10-20초 정도 소요됩니다.'} 잠시만 기다려주세요!
            </p>
          </div>
        )}

        {/* 🔄 예전 방식: 도움말 섹션 */}
        {!isAnalyzing && (
          <div style={{
            marginTop: '30px',
            padding: '20px',
            backgroundColor: '#fff',
            borderRadius: '10px',
            border: '1px solid #e9ecef'
          }}>
            <h3>💡 나만의 웹툰 만들기 팁</h3>
            <ul style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
              <li>{hasCharacter ? '캐릭터와 일기 내용을 바탕으로 실제 웹툰 장면이 생성됩니다' : '캐릭터를 만들면 일기 내용에 맞는 실제 장면 이미지가 생성됩니다'}</li>
              <li>구체적인 장소와 상황을 적으면 더 생생한 웹툰이 됩니다</li>
              <li>등장인물, 행동, 대화 등을 포함하면 풍부한 장면이 만들어져요</li>
              <li>매일 작성하면 나만의 웹툰 시리즈가 완성돼요</li>
            </ul>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </PageWrapper>
  );
};

export default EmotionInput;