import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/Result.css';

const Result = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { analysis, story, characterData, diaryText } = location.state || {};

  // useEffect로 네비게이션 처리
  useEffect(() => {
    if (!analysis) {
      navigate('/');
    }
  }, [analysis, navigate]);

  // analysis가 없으면 로딩 표시
  if (!analysis) {
    return (
      <div className="result-container">
        <p>분석 결과를 불러오는 중...</p>
      </div>
    );
  }

  // 감정에 따른 색상 테마
  const emotionColors = {
    '기쁨': '#FFF9E6',
    '슬픔': '#E6F3FF',
    '분노': '#FFE6E6',
    '불안': '#F3E6FF',
    '평온': '#E6FFE6'
  };

  // 감정 이모지
  const emotionEmojis = {
    '기쁨': '😊',
    '슬픔': '😢',
    '분노': '😡',
    '불안': '😰',
    '평온': '😌'
  };

  const bgColor = emotionColors[analysis.emotion] || '#F8F9FA';
  const emoji = emotionEmojis[analysis.emotion] || '🙂';

  return (
    <div className="result-container" style={{ backgroundColor: bgColor }}>
      <div className="result-header">
        <h1 className="result-title">오늘의 감정 분석 결과 ✨</h1>
        <p className="result-date">{new Date().toLocaleDateString('ko-KR')}</p>
      </div>
      
      {/* 감정 분석 결과 */}
      <div className="emotion-card">
        <div className="emotion-main">
          <div className="emotion-emoji">{emoji}</div>
          <h2 className="emotion-name">{analysis.emotion}</h2>
          <div className="emotion-intensity">
            감정 강도: {analysis.emotion_intensity}/10
            <div className="intensity-bar">
              <div 
                className="intensity-fill"
                style={{ 
                  width: `${analysis.emotion_intensity * 10}%`,
                  backgroundColor: emotionColors[analysis.emotion] 
                }}
              />
            </div>
          </div>
        </div>

        {analysis.sub_emotions?.length > 0 && (
          <div className="sub-emotions">
            <span className="detail-label">부가 감정:</span>
            {analysis.sub_emotions.map((emotion, idx) => (
              <span key={idx} className="sub-emotion-tag">{emotion}</span>
            ))}
          </div>
        )}

        {analysis.one_line && (
          <p className="one-line-summary">"{analysis.one_line}"</p>
        )}
      </div>

      {/* 오늘의 요약 */}
      <div className="summary-card">
        <h3 className="summary-title">오늘의 요약</h3>
        <p className="summary-text">{analysis.summary}</p>
        
        {analysis.keywords?.length > 0 && (
          <div className="keyword-list">
            {analysis.keywords.map((keyword, idx) => (
              <span key={idx} className="keyword-tag">#{keyword}</span>
            ))}
          </div>
        )}
      </div>

      {/* 웹툰 스토리 */}
      {story?.panels && story.panels.length > 0 && (
        <div className="webtoon-section">
          <h2 className="section-title">오늘의 웹툰 🎨</h2>
          <div className="webtoon-panels">
            {story.panels.map((panel, idx) => (
              <div key={idx} className="panel-card">
                <div className="panel-header">
                  <span className="panel-number">#{idx + 1}</span>
                </div>
                {panel.image_url ? (
                  <div className="panel-image-container">
                    <img 
                      src={panel.image_url} 
                      alt={`Panel ${idx + 1}`}
                      className="panel-image"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <div className="panel-placeholder" style={{ display: 'none' }}>
                      <p>{panel.scene}</p>
                    </div>
                  </div>
                ) : (
                  <div className="panel-placeholder">
                    <p>{panel.scene}</p>
                  </div>
                )}
                {panel.dialogue && (
                  <p className="panel-dialogue">💬 "{panel.dialogue}"</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 원본 일기 */}
      {diaryText && (
        <details className="original-diary">
          <summary>📝 원본 일기 보기</summary>
          <div className="diary-content">
            <p>{diaryText}</p>
          </div>
        </details>
      )}

      {/* 버튼 그룹 */}
      <div className="action-buttons">
        <button 
          onClick={() => navigate('/')} 
          className="action-button secondary-button"
        >
          🏠 홈으로
        </button>
        <button 
          onClick={() => navigate('/gallery')} 
          className="action-button primary-button"
        >
          🖼️ 갤러리 보기
        </button>
        <button 
          onClick={() => navigate('/emotion-input')} 
          className="action-button secondary-button"
        >
          ✏️ 다시 작성
        </button>
      </div>
    </div>
  );
};

export default Result;