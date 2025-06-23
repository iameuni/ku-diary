import React, { useState } from "react";
import { auth } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";

function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // 비밀번호 확인
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    if (!email || !password || !confirmPassword) {
      setError("모든 항목을 입력해주세요.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      navigate("/"); // 홈으로 이동
    } catch (err) {
      console.error("회원가입 오류:", err.code, err.message);
      let errorMessage = "회원가입 중 오류가 발생했습니다. 다시 시도해주세요.";
      switch (err.code) {
        case "auth/email-already-in-use":
          errorMessage = "이미 사용 중인 이메일(아이디)입니다.";
          break;
        case "auth/invalid-email":
          errorMessage = "유효하지 않은 이메일(아이디) 형식입니다.";
          break;
        case "auth/weak-password":
          errorMessage = "비밀번호는 6자 이상이어야 합니다.";
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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "80vh",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          padding: "40px",
          borderRadius: "8px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          backgroundColor: "#ffffff",
          width: "100%",
          maxWidth: "400px",
        }}
      >
        <h2
          style={{ textAlign: "center", marginBottom: "30px", color: "#333" }}
        >
          회원가입
        </h2>
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "20px" }}
        >
          <div>
            <label htmlFor="signup-email" style={labelStyle}>
              아이디 (이메일):
            </label>
            <input
              type="email"
              id="signup-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일 주소를 입력하세요"
              required
              style={inputStyle}
            />
          </div>
          <div>
            <label htmlFor="signup-password" style={labelStyle}>
              비밀번호 (6자 이상):
            </label>
            <input
              type="password"
              id="signup-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              required
              minLength="6"
              style={inputStyle}
            />
          </div>
          <div>
            <label htmlFor="confirm-password" style={labelStyle}>
              비밀번호 확인:
            </label>
            <input
              type="password"
              id="confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="비밀번호를 다시 입력하세요"
              required
              style={inputStyle}
            />
          </div>
          {error && (
            <p
              style={{
                color: "red",
                textAlign: "center",
                margin: "0",
                fontSize: "0.9em",
              }}
            >
              {error}
            </p>
          )}
          <input
            type="submit"
            value={loading ? "가입 처리 중..." : "회원가입"}
            disabled={loading}
            style={submitStyle}
          />
        </form>

        {/* 로그인 / 홈으로 이동 버튼 */}
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <button
            onClick={() => navigate("/login")}
            style={{
              backgroundColor: "#4f46e5",
              color: "white",
              padding: "10px 16px",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              marginRight: "10px",
              fontSize: "14px",
            }}
          >
            로그인
          </button>
          <button
            onClick={() => navigate("/")}
            style={{
              backgroundColor: "#6b7280",
              color: "white",
              padding: "10px 16px",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            홈으로
          </button>
        </div>
      </div>
    </div>
  );
}

const labelStyle = {
  display: "block",
  marginBottom: "8px",
  color: "#555",
  fontWeight: "bold",
};

const inputStyle = {
  width: "100%",
  padding: "12px",
  border: "1px solid #ddd",
  borderRadius: "4px",
  boxSizing: "border-box",
};

const submitStyle = {
  backgroundColor: "#007bff",
  color: "white",
  padding: "12px 20px",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "16px",
  fontWeight: "bold",
  marginTop: "10px",
};

export default SignUpPage;