import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./Auth.module.css";

function EyeIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function EyeOffIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.12 14.12a3 3 0 1 1-4.24-4.24"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="1"
        y1="1"
        x2="23"
        y2="23"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Auth() {
  const [isToggled, setIsToggled] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showApprovalCard, setShowApprovalCard] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [approvalType, setApprovalType] = useState("register");
  const approvalTimerRef = useRef(null);

  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });

  const [registerData, setRegisterData] = useState({
    username: "",
    password: "",
  });

  const [loginMsg, setLoginMsg] = useState({ text: "", type: "" });
  const [registerMsg, setRegisterMsg] = useState({ text: "", type: "" });

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 120);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    return () => {
      if (approvalTimerRef.current) clearTimeout(approvalTimerRef.current);
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("https://govindanvegetables-backend.onrender.com/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });

      // Backend returns plain string on errors, JSON object on success
      const text = await res.text();
      let data = null;
      try { data = JSON.parse(text); } catch { data = null; }

      // plain string error (e.g. "Account not approved", "Invalid credentials")
      const rawMsg = (data === null ? text : (data.message ?? text)).toLowerCase();

      // ── Backend sends 400 for unapproved users ──
      if (!res.ok) {
        const isNotApproved =
          rawMsg.includes("not approved") ||
          rawMsg.includes("pending") ||
          rawMsg.includes("awaiting") ||
          rawMsg.includes("under review") ||
          rawMsg.includes("approve");

        if (isNotApproved) {
          setApprovalType("login");
          setShowApprovalCard(true);
          if (approvalTimerRef.current) clearTimeout(approvalTimerRef.current);
          approvalTimerRef.current = setTimeout(() => {
            setShowApprovalCard(false);
          }, 7000);
          return;
        }

        // normal errors (wrong password, user not found, etc.)
        setLoginMsg({
          text: text || "Login failed",
          type: "error",
        });
        setTimeout(() => setLoginMsg({ text: "", type: "" }), 3000);
        return;
      }

      // ── 200 OK but status field is not APPROVED ──
      if (data?.status?.toUpperCase() !== "APPROVED") {
        setApprovalType("login");
        setShowApprovalCard(true);
        if (approvalTimerRef.current) clearTimeout(approvalTimerRef.current);
        approvalTimerRef.current = setTimeout(() => {
          setShowApprovalCard(false);
        }, 7000);
        return;
      }

      setLoginMsg({
        text: "Login successful! Redirecting...",
        type: "success",
      });

      localStorage.setItem("user", JSON.stringify(data));

      setTimeout(() => {

   // ADMIN → Dashboard
   if (data.role === "ADMIN") {
      window.location.href = "/dashboard";
   }

   // USER → Home
   else {
      window.location.href = "/";
   }

}, 1500);
    } catch (err) {
      console.error(err);
      setLoginMsg({
        text: "Server error. Please try again.",
        type: "error",
      });
      setTimeout(() => setLoginMsg({ text: "", type: "" }), 3000);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("https://govindanvegetables-backend.onrender.com/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerData),
      });

      const data = await res.json();

      if (!res.ok) {
        setRegisterMsg({
          text: data.message || "Registration failed",
          type: "error",
        });
        setTimeout(() => setRegisterMsg({ text: "", type: "" }), 3000);
        return;
      }

      setRegisterMsg({ text: "", type: "" });
      setApprovalType("register");
      setShowApprovalCard(true);

      if (approvalTimerRef.current) clearTimeout(approvalTimerRef.current);

      approvalTimerRef.current = setTimeout(() => {
        setShowApprovalCard(false);
        setIsToggled(false);
        setRegisterData({
          username: "",
          password: "",
        });
      }, 6000);
    } catch (err) {
      console.error(err);
      setRegisterMsg({
        text: "Server error. Please try again.",
        type: "error",
      });
      setTimeout(() => setRegisterMsg({ text: "", type: "" }), 3000);
    }
  };

  return (
    <div className={`${styles.authPage} ${isLoaded ? styles.loaded : ""}`}>
      <div className={styles.authBg}></div>
      <div className={styles.authOverlay}></div>

      <div className={`${styles.authWrapper} ${isToggled ? styles.toggled : ""}`}>
        <div className={styles.backgroundShape}></div>
        <div className={styles.secondaryShape}></div>

        {/* ── LOGIN PANEL ── */}
        <div className={`${styles.credentialsPanel} ${styles.signin}`}>
          <h2 className={styles.slideElement}>Login</h2>

          <form onSubmit={handleLogin}>
            {/* Username */}
            <div className={`${styles.fieldWrapper} ${styles.slideElement}`}>
              <input
                className={styles.inputField}
                type="text"
                required
                value={loginData.username}
                onChange={(e) =>
                  setLoginData({ ...loginData, username: e.target.value })
                }
              />
              <label className={styles.fieldLabel}>Username</label>
              <UserIcon className={styles.fieldIcon} />
            </div>

            {/* Password with eye toggle */}
            <div className={`${styles.fieldWrapper} ${styles.slideElement}`}>
              <input
                className={styles.inputField}
                type={showLoginPassword ? "text" : "password"}
                required
                value={loginData.password}
                onChange={(e) =>
                  setLoginData({ ...loginData, password: e.target.value })
                }
              />
              <label className={styles.fieldLabel}>Password</label>
              <button
                type="button"
                className={styles.eyeToggle}
                onClick={() => setShowLoginPassword((prev) => !prev)}
                tabIndex={-1}
              >
                {showLoginPassword ? (
                  <EyeOffIcon className={styles.fieldIcon} />
                ) : (
                  <EyeIcon className={styles.fieldIcon} />
                )}
              </button>
            </div>

            {loginMsg.text && (
              <div className={`${styles.inlineMessage} ${styles[loginMsg.type]}`}>
                <span className={styles.msgIcon}>
                  {loginMsg.type === "success" ? "✓" : "✕"}
                </span>
                {loginMsg.text}
              </div>
            )}

            <div className={`${styles.fieldWrapper} ${styles.slideElement}`}>
              <button className={styles.submitButton} type="submit">
                Login
              </button>
            </div>

            <div className={`${styles.switchLink} ${styles.slideElement}`}>
              <p>
                Don't have an account? <br />
                <a
                  href="#signup"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsToggled(true);
                    setShowApprovalCard(false);
                  }}
                >
                  Sign Up
                </a>
              </p>
            </div>
          </form>
        </div>

        {/* ── LOGIN WELCOME ── */}
        <div className={`${styles.welcomeSection} ${styles.signin}`}>
          <h2 className={styles.slideElement}>WELCOME BACK!</h2>
          <p className={styles.slideElement}>
            Login to continue managing your dashboard.
          </p>
        </div>

        {/* ── REGISTER PANEL ── */}
        <div className={`${styles.credentialsPanel} ${styles.signup}`}>
          <AnimatePresence mode="wait">
            {!showApprovalCard ? (
              <motion.div
                key="register-form"
                className={styles.fullPanelSwap}
                initial={{ opacity: 0, x: 40, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -30, scale: 0.98 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <h2 className={styles.slideElement}>Register</h2>

                <form onSubmit={handleRegister}>
                  {/* Username */}
                  <div className={`${styles.fieldWrapper} ${styles.slideElement}`}>
                    <input
                      className={styles.inputField}
                      type="text"
                      required
                      value={registerData.username}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          username: e.target.value,
                        })
                      }
                    />
                    <label className={styles.fieldLabel}>Username</label>
                    <UserIcon className={styles.fieldIcon} />
                  </div>

                  {/* Password with eye toggle */}
                  <div className={`${styles.fieldWrapper} ${styles.slideElement}`}>
                    <input
                      className={styles.inputField}
                      type={showRegisterPassword ? "text" : "password"}
                      required
                      value={registerData.password}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          password: e.target.value,
                        })
                      }
                    />
                    <label className={styles.fieldLabel}>Password</label>
                    <button
                      type="button"
                      className={styles.eyeToggle}
                      onClick={() => setShowRegisterPassword((prev) => !prev)}
                      tabIndex={-1}
                    >
                      {showRegisterPassword ? (
                        <EyeOffIcon className={styles.fieldIcon} />
                      ) : (
                        <EyeIcon className={styles.fieldIcon} />
                      )}
                    </button>
                  </div>

                  {registerMsg.text && (
                    <div
                      className={`${styles.inlineMessage} ${styles[registerMsg.type]}`}
                    >
                      <span className={styles.msgIcon}>✕</span>
                      {registerMsg.text}
                    </div>
                  )}

                  <div className={`${styles.fieldWrapper} ${styles.slideElement}`}>
                    <button className={styles.submitButton} type="submit">
                      Register
                    </button>
                  </div>

                  <div className={`${styles.switchLink} ${styles.slideElement}`}>
                    <p>
                      Already have an account? <br />
                      <a
                        href="#login"
                        onClick={(e) => {
                          e.preventDefault();
                          setIsToggled(false);
                          setShowApprovalCard(false);
                        }}
                      >
                        Sign In
                      </a>
                    </p>
                  </div>
                </form>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {/* ── REGISTER WELCOME ── */}
        <div className={`${styles.welcomeSection} ${styles.signup}`}>
          <h2 className={styles.slideElement}>WELCOME!</h2>
          <p className={styles.slideElement}>
            Create your account to access the platform.
          </p>
        </div>
      </div>

      {/* ── APPROVAL OVERLAY ── */}
      <AnimatePresence>
        {showApprovalCard && (
          <motion.div
            className={styles.fullScreenApprovalOverlay}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              className={styles.fullScreenApprovalCard}
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 12, opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className={styles.fullApprovalIconWrap}>
                <div className={styles.fullApprovalRing}></div>
                <svg
                  className={styles.fullApprovalIcon}
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    cx="12"
                    cy="13"
                    r="6.5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                  <path
                    d="M12 13l-2.2-2.2"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M12 7V4"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M9 4h6"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M17.5 7.5l1.6-1.6"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <h2 className={styles.fullApprovalTitle}>
                Waiting for Admin Approval
              </h2>

              <p className={styles.fullApprovalText}>
                {approvalType === "register"
                  ? "Your registration has been submitted successfully. Please wait while the administrator reviews your access and activates your account."
                  : "Your account is still under admin review. Please wait until the administrator approves your access."}
              </p>

              <div className={styles.fullApprovalLoader}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function UserIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M4 20a8 8 0 0 1 16 0"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

function LockIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect
        x="5"
        y="11"
        width="14"
        height="9"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M8 11V8a4 4 0 1 1 8 0v3"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

export default Auth;