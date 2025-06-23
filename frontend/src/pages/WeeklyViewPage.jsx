import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../components/PageWrapper';

const WeeklyViewPage = () => {
  const navigate = useNavigate();
  const [weeklyData, setWeeklyData] = useState([]);
  const [weeklyNarrative, setWeeklyNarrative] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('storyboard'); // storyboard, timeline, grid

  useEffect(() => {
    loadWeeklyData();
  }, []);

  const loadWeeklyData = () => {
    try {
      const allWebtoons = JSON.parse(localStorage.getItem('webtoons')) || [];
      
      // 최근 7일치 데이터 가져오기
      const recentWebtoons = allWebtoons.slice(-7);
      
      if (recentWebtoons.length < 7) {
        setError(`일주일치 데이터가 부족합니다. (현재: ${recentWebtoons.length}/7일)`);
        return;
      }
      
      setWeeklyData(recentWebtoons);
      
      // 🔑 경량화된 내레이션만 생성 (이미지 생성 X)
      generateWeeklyNarrative(recentWebtoons);
      
    } catch (err) {
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
      console.error('주간 데이터 로딩 오류:', err);
    }
  };

  // 🔑 새로운 방식: 텍스트 내레이션만 생성 (비용 절약!)
  const generateWeeklyNarrative = async (data) => {
    setLoading(true);
    setError('');
    
    try {
      console.log('📝 주간 내레이션 생성 시작...', data);
      
      // 🔑 기존 데이터에서 분석 정보 추출
      const dailyAnalyses = data.map((day, index) => ({
        emotion: day.emotion.includes(' ') ? day.emotion.split(' ')[1] : day.emotion,
        emotion_intensity: day.emotion_intensity || 5,
        summary: day.summary || day.inputText || '',
        one_line: day.scene || day.dialogue || day.summary || day.inputText || `Day ${index + 1}의 하루`,
        keywords: day.keywords || [],
        day_number: day.dayNumber || index + 1
      }));

      // 🔑 새로운 경량화된 API 엔드포인트 (만들어야 함)
      const response = await fetch('/api/diary/generate_weekly_narrative', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          daily_analyses: dailyAnalyses,
          generate_images: false // 🔑 이미지 생성 안함!
        }),
      });

      if (!response.ok) {
        throw new Error(`API 요청 실패: ${response.status}`);
      }

      const result = await response.json();
      console.log('📖 주간 내레이션 생성 완료:', result);
      
      setWeeklyNarrative(result);
      
    } catch (err) {
      console.error('주간 내레이션 생성 오류:', err);
      
      // 🔑 API 실패시 클라이언트에서 간단한 내레이션 생성
      const fallbackNarrative = generateFallbackNarrative(data);
      setWeeklyNarrative(fallbackNarrative);
    } finally {
      setLoading(false);
    }
  };

  // 🔑 API 실패시 대체 내레이션 생성
  const generateFallbackNarrative = (data) => {
    const dayNames = ['월', '화', '수', '목', '금', '토', '일'];
    const emotionFlow = data.map(d => d.emotion.includes(' ') ? d.emotion.split(' ')[1] : d.emotion);
    
    const dailyNarratives = data.map((day, index) => ({
      day: `${dayNames[index]}요일`,
      narrative: day.scene || day.summary || day.inputText || `${dayNames[index]}요일의 특별한 순간`,
      connector: index < 6 ? "그리고..." : ""
    }));

    return {
      daily_narratives: dailyNarratives,
      weekly_summary: `${emotionFlow[0]}로 시작해서 ${emotionFlow[emotionFlow.length - 1]}로 마무리한 의미 있는 한 주였습니다.`,
      emotional_journey: `이번 주는 다양한 감정을 경험한 풍성한 한 주였어요.`,
      emotion_flow: emotionFlow,
      generation_cost: "클라이언트에서 생성 - 무료!"
    };
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', { 
      month: 'short', 
      day: 'numeric',
      weekday: 'short'
    });
  };

  const getEmotionEmoji = (emotion) => {
    const emojis = {
      '기쁨': '😊', '슬픔': '😢', '분노': '😡', 
      '불안': '😰', '평온': '😌', '중립': '🙂'
    };
    const pureEmotion = emotion.includes(' ') ? emotion.split(' ')[1] : emotion;
    return emojis[pureEmotion] || '🙂';
  };

  if (error && !weeklyNarrative) {
    return (
      <PageWrapper>
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '50px 20px' }}>
          <h2 style={{ color: '#dc3545', marginBottom: '20px' }}>⚠️ 알림</h2>
          <p style={{ fontSize: '16px', color: '#666', marginBottom: '30px' }}>
            {error}
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button
              onClick={() => navigate('/gallery')}
              style={{
                padding: '12px 24px',
                backgroundColor: '#007bff',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              📁 갤러리로 돌아가기
            </button>
            <button
              onClick={() => navigate('/input')}
              style={{
                padding: '12px 24px',
                backgroundColor: '#28a745',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              ✏️ 일기 작성하기
            </button>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
        
        {/* 헤더 */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '28px', marginBottom: '10px' }}>
            📖 한 주의 스토리보드
          </h1>
          <p style={{ color: '#666', fontSize: '16px' }}>
            일주일간의 감정 여정을 하나의 이야기로 만나보세요
          </p>
          {weeklyNarrative?.generation_cost && (
            <p style={{ color: '#28a745', fontSize: '12px', marginTop: '5px' }}>
              💡 {weeklyNarrative.generation_cost}
            </p>
          )}
        </div>

        {/* 주간 감정 흐름 */}
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '30px'
        }}>
          <h3 style={{ fontSize: '18px', marginBottom: '15px', textAlign: 'center' }}>
            🎭 주간 감정 흐름
          </h3>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            {weeklyData.map((day, index) => (
              <div key={index} style={{ textAlign: 'center', flex: '1', minWidth: '80px' }}>
                <div style={{ fontSize: '24px', marginBottom: '5px' }}>
                  {getEmotionEmoji(day.emotion)}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {formatDate(day.date)}
                </div>
                <div style={{ fontSize: '10px', color: '#888' }}>
                  Day {day.dayNumber || index + 1}
                </div>
              </div>
            ))}
          </div>
          
          {weeklyNarrative?.emotional_journey && (
            <div style={{ 
              textAlign: 'center', 
              marginTop: '15px', 
              fontSize: '14px', 
              color: '#0066cc',
              fontStyle: 'italic',
              backgroundColor: '#e7f3ff',
              padding: '10px',
              borderRadius: '8px'
            }}>
              "{weeklyNarrative.emotional_journey}"
            </div>
          )}
        </div>

        {/* 뷰 모드 선택 */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '10px',
          marginBottom: '30px'
        }}>
          <button
            onClick={() => setViewMode('storyboard')}
            style={{
              padding: '8px 16px',
              backgroundColor: viewMode === 'storyboard' ? '#007bff' : '#e9ecef',
              color: viewMode === 'storyboard' ? 'white' : '#333',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            📖 스토리보드
          </button>
          <button
            onClick={() => setViewMode('timeline')}
            style={{
              padding: '8px 16px',
              backgroundColor: viewMode === 'timeline' ? '#007bff' : '#e9ecef',
              color: viewMode === 'timeline' ? 'white' : '#333',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            ⏰ 타임라인
          </button>
          <button
            onClick={() => setViewMode('grid')}
            style={{
              padding: '8px 16px',
              backgroundColor: viewMode === 'grid' ? '#007bff' : '#e9ecef',
              color: viewMode === 'grid' ? 'white' : '#333',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            🎨 그리드
          </button>
        </div>

        {/* 로딩 상태 */}
        {loading && (
          <div style={{ 
            textAlign: 'center', 
            padding: '50px',
            backgroundColor: '#f8f9fa',
            borderRadius: '12px',
            marginBottom: '20px'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '15px' }}>📝</div>
            <h3>주간 이야기를 엮고 있어요...</h3>
            <p style={{ color: '#666', marginTop: '10px' }}>
              일주일간의 감정을 하나의 스토리로 연결하는 중입니다 (텍스트만 생성 - 빠르고 저렴!)
            </p>
          </div>
        )}

        {/* 🔑 스토리보드 뷰 - 기존 7개 이미지 + 내레이션 */}
        {viewMode === 'storyboard' && weeklyData.length > 0 && (
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '20px', marginBottom: '20px', textAlign: 'center' }}>
              📚 7일 스토리보드 (기존 이미지 활용)
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              {weeklyData.map((day, index) => {
                const narrative = weeklyNarrative?.daily_narratives?.[index];
                const dayNames = ['월', '화', '수', '목', '금', '토', '일'];
                
                return (
                  <div
                    key={index}
                    style={{
                      backgroundColor: '#fff',
                      border: '2px solid #e9ecef',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                      display: 'flex',
                      flexDirection: window.innerWidth < 768 ? 'column' : 'row'
                    }}
                  >
                    {/* 🔑 기존 웹툰 이미지 사용 */}
                    <div style={{ 
                      flex: window.innerWidth < 768 ? 'none' : '0 0 300px',
                      height: window.innerWidth < 768 ? '200px' : '250px'
                    }}>
                      <img
                        src={day.image}
                        alt={`Day ${index + 1}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div style={{
                        display: 'none',
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#f8f9fa',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#666',
                        fontSize: '14px'
                      }}>
                        이미지 로드 실패
                      </div>
                    </div>
                    
                    {/* 스토리 내용 */}
                    <div style={{ flex: 1, padding: '20px' }}>
                      {/* 헤더 */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        marginBottom: '15px'
                      }}>
                        <span style={{
                          backgroundColor: '#007bff',
                          color: 'white',
                          padding: '6px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          Day {index + 1} ({dayNames[index]})
                        </span>
                        <span style={{ fontSize: '20px' }}>
                          {getEmotionEmoji(day.emotion)} {day.emotion.includes(' ') ? day.emotion.split(' ')[1] : day.emotion}
                        </span>
                      </div>
                      
                      {/* AI 생성 내레이션 */}
                      {narrative?.narrative && (
                        <div style={{
                          backgroundColor: '#e7f3ff',
                          padding: '15px',
                          borderRadius: '8px',
                          marginBottom: '15px',
                          borderLeft: '4px solid #007bff'
                        }}>
                          <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '5px', color: '#0066cc' }}>
                            📝 AI 내레이션
                          </div>
                          <div style={{ fontSize: '14px', lineHeight: '1.5' }}>
                            {narrative.narrative}
                          </div>
                        </div>
                      )}
                      
                      {/* 원본 웹툰 정보 */}
                      <div style={{ marginBottom: '15px' }}>
                        {day.scene && (
                          <div style={{ marginBottom: '10px' }}>
                            <strong style={{ fontSize: '12px', color: '#666' }}>📍 장면:</strong>
                            <span style={{ fontSize: '14px', marginLeft: '8px' }}>{day.scene}</span>
                          </div>
                        )}
                        {day.dialogue && (
                          <div style={{ marginBottom: '10px' }}>
                            <strong style={{ fontSize: '12px', color: '#666' }}>💬 대사:</strong>
                            <span style={{ fontSize: '14px', marginLeft: '8px', fontStyle: 'italic' }}>"{day.dialogue}"</span>
                          </div>
                        )}
                        <div>
                          <strong style={{ fontSize: '12px', color: '#666' }}>📝 내용:</strong>
                          <span style={{ fontSize: '14px', marginLeft: '8px' }}>
                            {day.summary || day.inputText}
                          </span>
                        </div>
                      </div>
                      
                      {/* 연결어 */}
                      {narrative?.connector && index < weeklyData.length - 1 && (
                        <div style={{
                          textAlign: 'center',
                          fontSize: '14px',
                          color: '#666',
                          fontStyle: 'italic',
                          padding: '10px',
                          backgroundColor: '#f8f9fa',
                          borderRadius: '8px'
                        }}>
                          {narrative.connector}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 🔑 타임라인 뷰 */}
        {viewMode === 'timeline' && (
          <div style={{ position: 'relative', marginBottom: '30px' }}>
            <h3 style={{ fontSize: '20px', marginBottom: '20px', textAlign: 'center' }}>
              ⏰ 주간 타임라인
            </h3>
            
            {/* 세로 라인 */}
            <div style={{
              position: 'absolute',
              left: '50px',
              top: '60px',
              bottom: '60px',
              width: '3px',
              backgroundColor: '#007bff'
            }} />
            
            {weeklyData.map((day, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'flex-start',
                marginBottom: '30px',
                position: 'relative'
              }}>
                {/* 포인트 */}
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#007bff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  zIndex: 2,
                  position: 'relative'
                }}>
                  {index + 1}
                </div>
                
                {/* 콘텐츠 */}
                <div style={{
                  marginLeft: '20px',
                  backgroundColor: 'white',
                  padding: '15px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  flex: 1,
                  display: 'flex',
                  gap: '15px'
                }}>
                  <img
                    src={day.image}
                    alt={`Day ${index + 1}`}
                    style={{
                      width: '100px',
                      height: '100px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      flexShrink: 0
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>{formatDate(day.date)}</span>
                      <span>{getEmotionEmoji(day.emotion)} {day.emotion.includes(' ') ? day.emotion.split(' ')[1] : day.emotion}</span>
                    </div>
                    <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                      {day.scene || day.summary || day.inputText}
                    </div>
                    {weeklyNarrative?.daily_narratives?.[index]?.narrative && (
                      <div style={{ 
                        fontSize: '13px', 
                        color: '#0066cc',
                        fontStyle: 'italic',
                        backgroundColor: '#e7f3ff',
                        padding: '8px',
                        borderRadius: '4px'
                      }}>
                        💭 {weeklyNarrative.daily_narratives[index].narrative}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 🔑 그리드 뷰 */}
        {viewMode === 'grid' && (
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '20px', marginBottom: '20px', textAlign: 'center' }}>
              🎨 주간 그리드
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '15px',
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '12px',
              border: '2px solid #333'
            }}>
              {weeklyData.map((day, index) => {
                const dayNames = ['월', '화', '수', '목', '금', '토', '일'];
                return (
                  <div key={index} style={{
                    border: '2px solid #333',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    backgroundColor: '#fff'
                  }}>
                    <div style={{
                      backgroundColor: '#333',
                      color: 'white',
                      padding: '8px',
                      textAlign: 'center',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      Day {index + 1} ({dayNames[index]}) - {getEmotionEmoji(day.emotion)} {day.emotion.includes(' ') ? day.emotion.split(' ')[1] : day.emotion}
                    </div>
                    <img
                      src={day.image}
                      alt={`Day ${index + 1}`}
                      style={{
                        width: '100%',
                        height: '180px',
                        objectFit: 'cover'
                      }}
                    />
                    <div style={{
                      padding: '10px',
                      fontSize: '12px',
                      textAlign: 'center',
                      backgroundColor: '#f8f9fa',
                      minHeight: '60px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {day.dialogue ? `"${day.dialogue}"` : day.scene || day.summary}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 주간 요약 */}
        {weeklyNarrative?.weekly_summary && (
          <div style={{
            backgroundColor: '#e7f3ff',
            padding: '20px',
            borderRadius: '12px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <h3 style={{ fontSize: '18px', marginBottom: '15px', color: '#0066cc' }}>
              📖 한 주의 마무리
            </h3>
            <p style={{ 
              fontSize: '16px', 
              lineHeight: '1.6',
              color: '#333',
              fontStyle: 'italic'
            }}>
              "{weeklyNarrative.weekly_summary}"
            </p>
          </div>
        )}

        {/* 하단 버튼들 */}
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => navigate('/gallery')}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              backgroundColor: '#6c757d',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
            }}
          >
            📁 갤러리로 돌아가기
          </button>
          
          <button
            onClick={() => loadWeeklyData()}
            disabled={loading}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              backgroundColor: loading ? '#dee2e6' : '#007bff',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            🔄 새로운 내레이션 생성
          </button>
          
          <button
            onClick={() => navigate('/input')}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              backgroundColor: '#28a745',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
            }}
          >
            ✏️ 새 일기 작성
          </button>
        </div>
      </div>
    </PageWrapper>
  );
};

export default WeeklyViewPage;