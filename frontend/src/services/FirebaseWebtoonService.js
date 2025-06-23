// src/services/FirebaseWebtoonService.js - 새 Firebase 프로젝트용
import { getFirestore, collection, doc, setDoc, getDocs, query, where, orderBy, deleteDoc } from 'firebase/firestore';
import { auth } from '../firebase';

class FirebaseWebtoonService {
  constructor() {
    this.db = getFirestore();
    this.projectId = 'ku-diary'; // 새 프로젝트 ID
    console.log('🔥 Firebase 웹툰 서비스 시작 - 프로젝트:', this.projectId);
  }

  // 현재 사용자 ID 가져오기
  getCurrentUserId() {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('사용자가 로그인되어 있지 않습니다.');
    }
    return user.uid;
  }

  // 🔥 새 Firebase 프로젝트용 웹툰 저장
  async saveWebtoon(webtoonData) {
    try {
      const userId = this.getCurrentUserId();
      const webtoonId = `${userId}_${Date.now()}`; // 사용자ID_타임스탬프 형태
      
      const webtoonEntry = {
        id: webtoonId,
        userId: userId, // 명시적으로 userId 추가
        ...webtoonData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        source: 'firebase',
        projectId: this.projectId // 프로젝트 ID 명시
      };

      console.log('🔥 새 Firebase에 저장 시도:', webtoonId);
      console.log('👤 사용자 ID:', userId);
      console.log('📋 프로젝트:', this.projectId);

      // Firebase에 저장
      await setDoc(doc(this.db, 'webtoons', webtoonId), webtoonEntry);

      console.log('✅ 새 Firebase 저장 완료:', webtoonId);
      return webtoonEntry;
    } catch (error) {
      console.error('❌ 새 Firebase 저장 실패:', error);
      
      // 에러 유형별 처리
      if (error.code === 'permission-denied') {
        console.log('🔧 권한 문제 - Firestore 규칙 확인 필요');
        throw new Error('저장 권한이 없습니다. Firebase 설정을 확인해주세요.');
      } else if (error.code === 'unauthenticated') {
        throw new Error('로그인이 필요합니다.');
      } else {
        // Firebase 저장 실패시 로컬 백업
        const localEntry = {
          id: Date.now(),
          userId: this.getCurrentUserId(),
          ...webtoonData,
          createdAt: new Date().toISOString(),
          source: 'local',
          needsSync: true,
          errorReason: error.message
        };
        
        this.saveToLocalStorage(localEntry);
        console.log('📱 로컬 백업 저장 완료:', localEntry.id);
        return localEntry;
      }
    }
  }

  // 🔥 새 Firebase에서 사용자 웹툰 로드
  async loadUserWebtoons() {
    try {
      const userId = this.getCurrentUserId();
      
      console.log('🔥 새 Firebase에서 웹툰 로드 시도');
      console.log('👤 사용자 ID:', userId);
      console.log('📋 프로젝트:', this.projectId);

      // Firebase에서 사용자 웹툰 쿼리
      const webtoonsRef = collection(this.db, 'webtoons');
      const q = query(
        webtoonsRef, 
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      
      const firebaseWebtoons = [];
      snapshot.forEach(doc => {
        firebaseWebtoons.push({
          ...doc.data(),
          id: doc.id,
          source: 'firebase'
        });
      });

      console.log(`🔥 새 Firebase 웹툰 로드 완료: ${firebaseWebtoons.length}개`);

      // 로컬 웹툰도 로드 (동기화되지 않은 것들만)
      const localWebtoons = this.getLocalWebtoons().filter(item => 
        item.needsSync === true || item.source === 'local'
      );

      console.log(`📱 로컬 웹툰 로드: ${localWebtoons.length}개`);

      // 중복 제거 후 병합
      const allWebtoons = [...firebaseWebtoons];
      
      localWebtoons.forEach(localItem => {
        // Firebase에 같은 내용의 웹툰이 없는 경우만 추가
        const isDuplicate = firebaseWebtoons.some(firebaseItem => {
          return Math.abs(new Date(localItem.createdAt || localItem.date) - new Date(firebaseItem.createdAt)) < 60000;
        });
        
        if (!isDuplicate) {
          allWebtoons.push({
            ...localItem,
            source: 'local'
          });
        }
      });
      
      console.log(`📊 총 웹툰: ${allWebtoons.length}개 (Firebase: ${firebaseWebtoons.length}, 로컬: ${allWebtoons.length - firebaseWebtoons.length})`);
      
      return allWebtoons;
    } catch (error) {
      console.error('❌ 새 Firebase 웹툰 로드 실패:', error);
      
      // 권한 문제인지 확인
      if (error.code === 'permission-denied') {
        console.log('🔧 Firestore 읽기 권한 문제');
        throw new Error('웹툰을 불러올 권한이 없습니다. Firebase 설정을 확인해주세요.');
      }
      
      // Firebase 실패시 로컬 데이터만 반환
      const localWebtoons = this.getLocalWebtoons().map(item => ({
        ...item,
        source: 'local'
      }));
      
      console.log(`📱 오프라인 모드: 로컬 웹툰 ${localWebtoons.length}개만 표시`);
      return localWebtoons;
    }
  }

  // 🔥 새 Firebase에서 웹툰 삭제
  async deleteWebtoon(webtoonId) {
    try {
      const userId = this.getCurrentUserId();
      
      console.log('🗑️ 새 Firebase에서 웹툰 삭제 시도:', webtoonId);
      console.log('👤 사용자 ID:', userId);

      // Firebase에서 삭제
      await deleteDoc(doc(this.db, 'webtoons', webtoonId));
      
      console.log('✅ 새 Firebase 삭제 완료:', webtoonId);
      
      // 로컬스토리지에서도 삭제
      this.removeFromLocalStorage(webtoonId);
      
      console.log('✅ 웹툰 삭제 완료:', webtoonId);
    } catch (error) {
      console.error('❌ 새 Firebase 웹툰 삭제 실패:', error);
      
      // 로컬에서는 삭제 시도
      this.removeFromLocalStorage(webtoonId);
      
      // 에러 유형별 메시지
      if (error.code === 'permission-denied') {
        throw new Error('삭제 권한이 없습니다. 본인이 만든 웹툰만 삭제할 수 있습니다.');
      } else if (error.code === 'not-found') {
        throw new Error('삭제하려는 웹툰을 찾을 수 없습니다.');
      } else if (error.code === 'unauthenticated') {
        throw new Error('로그인이 필요합니다.');
      } else {
        throw new Error(`삭제 중 오류 발생: ${error.message}`);
      }
    }
  }

  // 로컬스토리지 관련 메소드들 (기존과 동일)
  saveToLocalStorage(webtoonEntry) {
    try {
      const existingWebtoons = JSON.parse(localStorage.getItem('webtoons') || '[]');
      
      const isDuplicate = existingWebtoons.some(item => 
        item.id === webtoonEntry.id || 
        Math.abs(new Date(item.createdAt || item.date) - new Date(webtoonEntry.createdAt)) < 60000
      );
      
      if (!isDuplicate) {
        const updatedWebtoons = [webtoonEntry, ...existingWebtoons];
        const limitedWebtoons = updatedWebtoons.slice(0, 100);
        localStorage.setItem('webtoons', JSON.stringify(limitedWebtoons));
      }
    } catch (error) {
      console.error('❌ 로컬스토리지 저장 실패:', error);
    }
  }

  removeFromLocalStorage(webtoonId) {
    try {
      const existingWebtoons = JSON.parse(localStorage.getItem('webtoons') || '[]');
      const updatedWebtoons = existingWebtoons.filter(w => 
        w.id !== webtoonId && 
        w.id !== parseInt(webtoonId)
      );
      localStorage.setItem('webtoons', JSON.stringify(updatedWebtoons));
      localStorage.setItem('webtoonGallery', JSON.stringify(updatedWebtoons));
    } catch (error) {
      console.error('❌ 로컬스토리지 삭제 실패:', error);
    }
  }

  getLocalWebtoons() {
    try {
      return JSON.parse(localStorage.getItem('webtoons') || '[]');
    } catch (error) {
      console.error('❌ 로컬스토리지 로드 실패:', error);
      return [];
    }
  }

  // 병합 및 기타 메소드들 (기존과 동일)
  mergeWebtoons(firebaseWebtoons, localWebtoons) {
    const webtoonMap = new Map();
    
    firebaseWebtoons.forEach(webtoon => {
      webtoonMap.set(webtoon.id, { ...webtoon, source: 'firebase' });
    });
    
    localWebtoons.forEach(webtoon => {
      if (!webtoonMap.has(webtoon.id)) {
        const isDuplicate = Array.from(webtoonMap.values()).some(existingWebtoon => {
          const timeDiff = Math.abs(
            new Date(webtoon.createdAt || webtoon.date) - 
            new Date(existingWebtoon.createdAt || existingWebtoon.date)
          );
          return timeDiff < 60000;
        });
        
        if (!isDuplicate) {
          webtoonMap.set(webtoon.id, { ...webtoon, source: 'local', needsSync: true });
        }
      }
    });
    
    return Array.from(webtoonMap.values())
      .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
  }

  async syncLocalToFirebase() {
    try {
      const localWebtoons = this.getLocalWebtoons().filter(w => w.needsSync || w.source === 'local');
      
      console.log(`🔄 새 Firebase로 동기화할 로컬 웹툰: ${localWebtoons.length}개`);
      
      for (const webtoon of localWebtoons) {
        try {
          const { needsSync, source, errorReason, ...webtoonData } = webtoon;
          await this.saveWebtoon(webtoonData);
          console.log('✅ 웹툰 동기화 완료:', webtoon.id);
        } catch (error) {
          console.error('❌ 웹툰 동기화 실패:', webtoon.id, error);
        }
      }
      
      console.log('🎉 새 Firebase 동기화 완료!');
    } catch (error) {
      console.error('❌ 전체 동기화 실패:', error);
      throw error;
    }
  }

  calculateStats(webtoons) {
    const emotionCounts = {};
    const imageCounts = { webtoon: 0, character: 0 };
    const sourceCounts = { firebase: 0, local: 0 };
    
    webtoons.forEach(webtoon => {
      const emotion = webtoon.emotion || '중립';
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
      
      if (webtoon.hasWebtoonImage) {
        imageCounts.webtoon++;
      } else {
        imageCounts.character++;
      }
      
      if (webtoon.source === 'firebase') {
        sourceCounts.firebase++;
      } else {
        sourceCounts.local++;
      }
    });
    
    return {
      total: webtoons.length,
      emotions: emotionCounts,
      imageTypes: imageCounts,
      sources: sourceCounts,
      recentCount: webtoons.filter(w => {
        const createdDate = new Date(w.createdAt || w.date);
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return createdDate > weekAgo;
      }).length
    };
  }

  async clearAllData() {
    try {
      const userId = this.getCurrentUserId();
      
      const webtoonsRef = collection(this.db, 'webtoons');
      const q = query(webtoonsRef, where('userId', '==', userId));
      const snapshot = await getDocs(q);
      
      const deletePromises = [];
      snapshot.forEach(doc => {
        deletePromises.push(deleteDoc(doc.ref));
      });
      
      await Promise.all(deletePromises);
      
      localStorage.removeItem('webtoons');
      localStorage.removeItem('webtoonGallery');
      
      console.log('🗑️ 새 Firebase 모든 웹툰 데이터 삭제 완료');
    } catch (error) {
      console.error('❌ 데이터 삭제 실패:', error);
      throw error;
    }
  }

  // 🔥 새 Firebase 연결 상태 체크
  async getConnectionStatus() {
    try {
      const userId = this.getCurrentUserId();
      const testQuery = query(collection(this.db, 'webtoons'), where('userId', '==', userId));
      await getDocs(testQuery);
      console.log('🔥 새 Firebase 연결 성공');
      return 'online';
    } catch (error) {
      console.log('📱 새 Firebase 연결 실패, 오프라인 모드:', error.message);
      return 'offline';
    }
  }
}

export default new FirebaseWebtoonService();