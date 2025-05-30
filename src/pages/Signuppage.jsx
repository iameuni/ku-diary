import React, { useState } from 'react';
import { auth } from '../firebase'; 
import { createUserWithEmailAndPassword } from 'firebase/auth';

function SignUp() {
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState(''); 
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    if (!email || !password) {
      setError("이메일(아이디)과 비밀번호를 모두 입력해주세요.");
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log("회원가입 성공:", user);
      alert(`회원가입에 성공했습니다! 환영합니다, ${user.email}님.`);
      setEmail(''); 
      setPassword('');
    } catch (err) {
      console.error("회원가입 오류:", err.code, err.message);
      let errorMessage = "회원가입 중 오류가 발생했습니다. 다시 시도해주세요.";
      switch (err.code) {
        case 'auth/email-already-in-use':
          errorMessage = '이미 사용 중인 이메일(아이디)입니다.';
          break;
        case 'auth/invalid-email':
          errorMessage = '유효하지 않은 이메일(아이디) 형식입니다.';
          break;
        case 'auth/weak-password':
          errorMessage = '비밀번호는 6자 이상이어야 합니다.';
          break;
        default:
          errorMessage = err.message || errorMessage;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh', // 화면 높이에 맞게 조정
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        backgroundColor: '#ffffff',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h2 style={{
          textAlign: 'center',
          marginBottom: '30px',
          color: '#333'
        }}>회원가입</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label
              htmlFor="signup-email"
              style={{ display: 'block', marginBottom: '8px', color: '#555', fontWeight: 'bold' }}
            >
              아이디 (이메일):
            </label>
            <input
              type="email"
              id="signup-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일 주소를 입력하세요"
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                boxSizing: 'border-box'
              }}
            />
          </div>
          <div>
            <label
              htmlFor="signup-password"
              style={{ display: 'block', marginBottom: '8px', color: '#555', fontWeight: 'bold' }}
            >
              비밀번호 (6자 이상):
            </label>
            <input
              type="password"
              id="signup-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="6자 이상 입력하세요"
              required
              minLength="6"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                boxSizing: 'border-box'
              }}
            />
          </div>
          {error && (
            <p style={{
              color: 'red',
              textAlign: 'center',
              margin: '10px 0 0 0', // 에러 메시지 위쪽 여백 제거
              fontSize: '0.9em'
            }}>
              {error}
            </p>
          )}
          <input
            type="submit"
            value={loading ? '가입 처리 중...' : '회원가입'}
            disabled={loading}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              padding: '12px 20px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              marginTop: '10px' // 버튼 위쪽 여백 추가
            }}
          />
        </form>
      </div>
    </div>
  );
}

export default SignUp;