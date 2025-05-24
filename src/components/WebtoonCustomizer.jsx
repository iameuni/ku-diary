import React, { useState, useEffect, useCallback } from 'react';

export const CUSTOMIZATION_STORAGE_KEY = 'userWebtoonCustomization';

export const EXPRESSION_OPTIONS = ["선택안함", "기쁨", "슬픔", "화남", "놀람", "행복"];
export const BACKGROUND_OPTIONS = ["선택안함", "교실", "공원", "바다", "집 안", "정류장"];

function WebtoonCustomizer() {
  const [expression, setExpression] = useState(EXPRESSION_OPTIONS[0]);
  const [background, setBackground] = useState(BACKGROUND_OPTIONS[0]);
  const [bubbleText, setBubbleText] = useState("");

  const loadCustomization = useCallback(() => {
    try {
      const storedCustomization = localStorage.getItem(CUSTOMIZATION_STORAGE_KEY);
      if (storedCustomization) {
        const parsedCustomization = JSON.parse(storedCustomization);
        if (parsedCustomization.expression && EXPRESSION_OPTIONS.includes(parsedCustomization.expression)) {
          setExpression(parsedCustomization.expression);
        }
        if (parsedCustomization.background && BACKGROUND_OPTIONS.includes(parsedCustomization.background)) {
          setBackground(parsedCustomization.background);
        }
        if (typeof parsedCustomization.bubbleText === 'string') {
          setBubbleText(parsedCustomization.bubbleText);
        }
      }
    } catch (error) {
      console.error("가져오기 실패", error);
    }
  }, []);

  const saveCustomization = useCallback(() => {
    try {
      const customizationData = {
        expression: expression === EXPRESSION_OPTIONS[0] ? null : expression,
        background: background === BACKGROUND_OPTIONS[0] ? null : background,
        bubbleText: bubbleText,
      };
      localStorage.setItem(CUSTOMIZATION_STORAGE_KEY, JSON.stringify(customizationData));
    } catch (error) {
      console.error("저장 실패", error);
    }
  }, [expression, background, bubbleText]);

  return null;
}

export default WebtoonCustomizer;