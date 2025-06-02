import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/EmotionInput.css';

const EmotionInput = () => {
  const navigate = useNavigate();
  const [diaryText, setDiaryText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [shouldNavigate, setShouldNavigate] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  // useEffect로 네비게이션 처리
  useEffect(() => {
    if (shouldNavigate && analysisResult) {
      navigate('/result', { state: { analysis: analysisResult } });
    }
  }, [shouldNavigate, analysisResult, navigate]);

  const analyzeDiary = async () => {
    if (!diaryText.trim()) {
      alert('일기를 입력해주세요!');
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/diary/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: diaryText }),
      });

      if (!response.ok) {
        throw new Error('분석 실패');
      }

      const data = await response.json();
      console.log('분석 결과:', data);
      
      // 분석 결과 저장
      setAnalysisResult(data);
      
      // 로컬 스토리지에 저장 (선택사항)
      localStorage.setItem('lastAnalysis', JSON.stringify({
        text: diaryText,
        analysis: data,
        date: new Date().toISOString()
      }));
      
      // 네비게이션 트리거
      setShouldNavigate(true);
      
    } catch (error) {
      console.error('Error:', error);
      alert('분석 중 오류가 발생했습니다.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="emotion-input-container">
      <div className="emotion-input-header">
        <h1 className="emotion-input-title">오늘의 일기 📝</h1>
        <p className="emotion-input-subtitle">
          오늘 하루는 어떠셨나요? 자유롭게 작성해주세요
        </p>
      </div>

      <textarea
        className="diary-textarea"
        value={diaryText}
        onChange={(e) => setDiaryText(e.target.value)}
        placeholder="오늘 있었던 일, 느낀 감정들을 자유롭게 적어주세요..."
        disabled={isAnalyzing}
      />

      <button
        className="submit-button"
        onClick={analyzeDiary}
        disabled={!diaryText.trim() || isAnalyzing}
      >
        {isAnalyzing ? '분석 중...' : '감정 분석하기'}
      </button>

      {isAnalyzing && (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <p>AI가 일기를 분석하고 있습니다...</p>
          <p style={{ fontSize: '14px', color: '#666' }}>
            잠시만 기다려주세요 ✨
          </p>
        </div>
      )}
    </div>
  );
};

export default EmotionInput;