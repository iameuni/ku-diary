import React, { useState } from "react";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    if (!email || !password) {
      setError("이메일과 비밀번호를 모두 입력해주세요.");
      setLoading(false);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      localStorage.setItem("userId", user.uid);
      navigate("/");
    } catch (err) {
      console.error("로그인 오류:", err.code, err.message);
      let errorMessage = "로그인 중 오류가 발생했습니다.";
      switch (err.code) {
        case "auth/user-not-found":
          errorMessage = "등록되지 않은 이메일입니다.";
          break;
        case "auth/wrong-password":
          errorMessage = "비밀번호가 일치하지 않습니다.";
          break;
        case "auth/invalid-email":
          errorMessage = "유효하지 않은 이메일 형식입니다.";
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
          style={{
            textAlign: "center",
            marginBottom: "30px",
            color: "#333",
          }}
        >
          로그인
        </h2>
        <form
          onSubmit={handleLogin}
          style={{ display: "flex", flexDirection: "column", gap: "20px" }}
        >
          <div>
            <label
              htmlFor="login-email"
              style={{
                display: "block",
                marginBottom: "8px",
                color: "#555",
                fontWeight: "bold",
              }}
            >
              이메일:
            </label>
            <input
              type="email"
              id="login-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일을 입력하세요"
              required
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                boxSizing: "border-box",
              }}
            />
          </div>
          <div>
            <label
              htmlFor="login-password"
              style={{
                display: "block",
                marginBottom: "8px",
                color: "#555",
                fontWeight: "bold",
              }}
            >
              비밀번호:
            </label>
            <input
              type="password"
              id="login-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              required
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                boxSizing: "border-box",
              }}
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
            value={loading ? "로그인 중..." : "로그인"}
            disabled={loading}
            style={{
              backgroundColor: "#007bff",
              color: "white",
              padding: "12px 20px",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "bold",
              marginTop: "10px",
            }}
          />
        </form>

        {/* 회원가입 & 홈으로 이동 버튼 추가 */}
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <button
            onClick={() => navigate("/sign-up")}
            style={{
              backgroundColor: "#10b981",
              color: "white",
              padding: "10px 16px",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              marginRight: "10px",
              fontSize: "14px",
            }}
          >
            회원가입
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

export default LoginPage;