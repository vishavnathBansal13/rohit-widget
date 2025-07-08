import { useState, ChangeEvent, FormEvent } from "react";
import "./AuthForm.css";
import {
  CategorizeTransactionWidget,
  PotentialDeductions,
} from "@rohit23061999/transaction-review-widget";
import { makeSessionToken } from "./helper/makeSessionToken";
import AddTransactionForm from "./helper/addTransactionForm";
import { createUser, getAccessToken } from "./api/api";
import { toast } from "react-toastify";
import HistoricalAnalysisWidget from "@rohit23061999/transaction-review-widget/dist/historicalAnalysisWidget/historicalAnalysis";

/* ------------------------------------------------------------------ */
/*  Type definitions                                                  */
/* ------------------------------------------------------------------ */
interface TokenForm {
  client_id: string;
  client_secret: string;
}
interface UserForm {
  username: string;
  email: string;
  plaid_user_id: string;
}
interface ManualWidgetForm {
  userId: string;
  access_token: string;
  session_token: string;
}
interface FormErrors {
  [key: string]: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */
export default function AuthForm() {
  const [tokenForm, setTokenForm] = useState<TokenForm>({
    client_id: "",
    client_secret: "",
  });
  const [userForm, setUserForm] = useState<UserForm>({
    username: "",
    email: "",
    plaid_user_id: "",
  });
  const [manualWidgetForm, setManualWidgetForm] = useState<ManualWidgetForm>({
    userId: "",
    access_token: "",
    session_token: "",
  });

  const [accessToken, setAccessToken] = useState("");
  const [userId, setUserId] = useState("");
  const [sessionToken, setSessionToken] = useState("");

  const [step, setStep] = useState<"token" | "user" | "session" | "widget">(
    "token"
  );
  const [showDirectConnect, setShowDirectConnect] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [widgetError, setWidgetError] = useState<string | null>(null);

  const handleTokenOrUserChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (step === "token") {
      setTokenForm((prev) => ({ ...prev, [name]: value }));
    } else {
      setUserForm((prev) => ({ ...prev, [name]: value }));
    }
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy[name];
      return copy;
    });
  };

  const handleManualWidgetChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setManualWidgetForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy[name];
      return copy;
    });
  };

  const handleManualWidgetSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setWidgetError(null);

    const { userId, access_token, session_token } = manualWidgetForm;
    const errs: FormErrors = {};
    if (!userId.trim()) errs.userId = "User ID is required.";
    if (!access_token.trim()) errs.access_token = "Access Token is required.";
    if (!session_token.trim())
      errs.session_token = "Session Token is required.";

    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setUserId(userId.trim());
    setAccessToken(access_token.trim());
    setSessionToken(session_token.trim());
    setStep("widget");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setWidgetError(null);

    try {
      if (step === "token") {
        const errs: FormErrors = {};
        if (!tokenForm.client_id.trim())
          errs.client_id = "Client ID is required.";
        if (!tokenForm.client_secret.trim())
          errs.client_secret = "Client Secret is required.";
        if (Object.keys(errs).length) {
          setErrors(errs);
          return;
        }

        const data = await getAccessToken(
          tokenForm.client_id,
          tokenForm.client_secret
        );
        setAccessToken(data.access_token);
        setStep("user");
      } else if (step === "user") {
        const errs: FormErrors = {};
        const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!userForm.username.trim()) errs.username = "Username is required.";
        if (userForm.username.trim().length < 3)
          errs.username = "Username must be at least 3 characters.";
        if (!userForm.email.trim()) errs.email = "Email is required.";
        else if (!emailRx.test(userForm.email.trim()))
          errs.email = "Email is not valid.";
        if (!userForm.plaid_user_id.trim())
          errs.plaid_user_id = "Plaid User ID is required.";
        else if (userForm.plaid_user_id.trim().length < 5)
          errs.plaid_user_id = "Plaid User ID must be at least 5 characters.";
        if (Object.keys(errs).length) {
          setErrors(errs);
          return;
        }

        const data = await createUser(userForm, accessToken);
        const newUserId = data.user_id;
        setUserId(newUserId);

        await makeSessionToken({
          userId: newUserId,
          access_token: accessToken,
          setLoading,
          setError: (msg: string) => setErrors({ session: msg }),
          onError: (msg: string) => setWidgetError(msg),
          onSuccess: setSessionToken,
        });

        setStep("session");
      } else if (step === "session") {
        setStep("widget");
      }
    } catch (err: any) {
      const message =
        err?.response?.data?.detail || err?.message || "Something went wrong";
      setWidgetError(message);
    } finally {
      setLoading(false);
    }
  };

  const [showAddTransactionForm, setShowAddTransactionForm] = useState(false);
  const [copiedField, setCopiedField] = useState<
    "userId" | "accessToken" | "sessionToken" | null
  >(null);
  const copyToClipboard = (
    txt: string,
    field: "userId" | "accessToken" | "sessionToken"
  ) => {
    navigator.clipboard
      .writeText(txt)
      .then(() => {
        setCopiedField(field);
        toast.success("Copied!", { toastId: "copied" });

        setTimeout(() => {
          setCopiedField(null);
        }, 2000);
      })
      .catch((err) => {
        console.error("Failed to copy:", err);
        toast.error("Failed to copy", { toastId: "failedtoast" });
      });
  };
  const [showWidget, setShowWidegt] = useState("TransWidegt");
  console.log(step, "stepstepstepstep");

  const widgets = [
    { key: "TransWidegt", label: "Transaction Widget" },
    { key: "DeductionWidegt", label: "DeductionWidegt Widget" },
    { key: "OCRWidget", label: "OCR Widget" },
  ];

  const renderButtons = () => {
    return widgets
      .filter((widget) => widget.key !== showWidget)
      .map((widget) => (
        <button
          key={widget.key}
          type="button"
          style={{
            backgroundColor: "#5387F1",
            border: "1px solid #5387F1",
            color: "white",
            fontSize: "0.875rem",
            fontWeight: 500,
            padding: "8px 16px",
            borderRadius: 8,
            marginRight: 8,
            cursor: "pointer",
          }}
          onClick={() => setShowWidegt(widget.key)}
        >
          Load {widget.label}
        </button>
      ));
  };

  
  return (
    <div
      className={widgetError || step === "widget" ? "" : "auth-form-container"}
    >
      {step === "token" && showDirectConnect && (
        <form
          onSubmit={handleManualWidgetSubmit}
          className="auth-form direct-widget-form"
        >
          <h3>Load Widget Manually</h3>

          <input
            type="text"
            name="userId"
            placeholder="User ID"
            value={manualWidgetForm.userId}
            onChange={handleManualWidgetChange}
          />
          {errors.userId && <p className="error">{errors.userId}</p>}

          <input
            type="text"
            name="access_token"
            placeholder="Access Token"
            value={manualWidgetForm.access_token}
            onChange={handleManualWidgetChange}
          />
          {errors.access_token && (
            <p className="error">{errors.access_token}</p>
          )}

          <input
            type="text"
            name="session_token"
            placeholder="Session Token"
            value={manualWidgetForm.session_token}
            onChange={handleManualWidgetChange}
          />
          {errors.session_token && (
            <p className="error">{errors.session_token}</p>
          )}

          <button type="submit" className="submit-btn">
            Load Widget
          </button>

          {widgetError && <p className="error">{widgetError}</p>}

          <p style={{ textAlign: "center", marginTop: "1rem" }}>
            <button
              type="button"
              onClick={() => {
                setTokenForm({ client_id: "", client_secret: "" });
                setShowDirectConnect(false);
                setErrors({});
                setWidgetError(null);
              }}
              className="link-btn"
            >
              ← Back to Auth Flow
            </button>
          </p>
        </form>
      )}

      {!showDirectConnect &&
        (step === "token" || step === "user" || step === "session") && (
          <form onSubmit={handleSubmit} className="auth-form">
            {step === "token" && (
              <>
                <h2>Step 1: Get Access Token</h2>

                <input
                  type="text"
                  name="client_id"
                  placeholder="Client ID"
                  value={tokenForm.client_id}
                  onChange={handleTokenOrUserChange}
                />
                {errors.client_id && (
                  <p className="error">{errors.client_id}</p>
                )}

                <input
                  type="text"
                  name="client_secret"
                  placeholder="Client Secret"
                  value={tokenForm.client_secret}
                  onChange={handleTokenOrUserChange}
                />
                {errors.client_secret && (
                  <p className="error">{errors.client_secret}</p>
                )}

                <p style={{ textAlign: "center", marginTop: "1rem" }}>
                  <button
                    type="button"
                    onClick={() => setShowDirectConnect(true)}
                    className="link-btn"
                  >
                    Direct Connect Widget
                  </button>
                </p>
              </>
            )}

            {step === "user" && (
              <>
                <h2>Step 2: Create User</h2>

                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={userForm.username}
                  onChange={handleTokenOrUserChange}
                />
                {errors.username && <p className="error">{errors.username}</p>}

                <input
                  type="text"
                  name="email"
                  placeholder="Email"
                  value={userForm.email}
                  onChange={handleTokenOrUserChange}
                />
                {errors.email && <p className="error">{errors.email}</p>}

                <input
                  type="text"
                  name="plaid_user_id"
                  placeholder="Plaid User ID"
                  value={userForm.plaid_user_id}
                  onChange={handleTokenOrUserChange}
                />
                {errors.plaid_user_id && (
                  <p className="error">{errors.plaid_user_id}</p>
                )}
              </>
            )}

            {step === "session" && (
              <>
                <h2>Step 3: Session Created</h2>

                <div className="info-box">
                  <p>
                    <strong>User ID:</strong> {userId}{" "}
                    <button
                      type="button"
                      onClick={() => copyToClipboard(userId, "userId")}
                      className="copy-btn"
                    >
                      {copiedField === "userId" ? "Copied" : "Copy"}
                    </button>
                  </p>
                </div>

                <div className="info-box">
                  <p>
                    <strong>Access Token:</strong> {accessToken}{" "}
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(accessToken, "accessToken")
                      }
                      className="copy-btn"
                    >
                      {copiedField === "accessToken" ? "Copied" : "Copy"}
                    </button>
                  </p>
                </div>

                <div className="info-box">
                  <p>
                    <strong>Session Token:</strong> {sessionToken}{" "}
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(sessionToken, "sessionToken")
                      }
                      className="copy-btn"
                    >
                      {copiedField === "sessionToken" ? "Copied" : "Copy"}
                    </button>
                  </p>
                </div>

                {errors.session && <p className="error">{errors.session}</p>}
              </>
            )}

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading
                ? "Processing..."
                : step === "session"
                ? "Open Widget"
                : `Continue to ${step === "token" ? "User" : "Session"}`}
            </button>
          </form>
        )}

      {step === "widget" && (
        <>
          {widgetError === "No categorized transactions found" ? (
            <>
              <div style={{ textAlign: "center", marginTop: "1rem" }}>
                <button
                  onClick={() => setShowAddTransactionForm(true)}
                  className="submit-btn"
                  style={{
                    backgroundColor: "#5387F1",
                    color: "white",
                    padding: "10px 20px",
                    borderRadius: "8px",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Add Transaction
                </button>
              </div>

              {showAddTransactionForm && (
                <div style={{ marginTop: "20px" }}>
                  <AddTransactionForm
                    userId={userId}
                    accessToken={accessToken}
                    onSuccess={() => {
                      setShowAddTransactionForm(false);
                      setWidgetError(null);
                    }}
                    onError={(msg: any) => setWidgetError(msg)}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="client-form-wrapper">
              <>
                {renderButtons()}

                {showWidget == "TransWidegt" && (
                  <CategorizeTransactionWidget
                    userId={userId}
                    access_token={accessToken}
                    session_token={sessionToken}
                    onError={(msg: any) => setWidgetError(msg)}
                  />
                )}
                {showWidget == "OCRWidget" && (
                  <HistoricalAnalysisWidget
                    userId={userId}
                    access_token={accessToken}
                    session_token={sessionToken}
                    onError={(msg) => setWidgetError(msg)}
                  />
                )}
                {showWidget == "DeductionWidegt" && (
                  <PotentialDeductions
                    userId={userId}
                    access_token={accessToken}
                    session_token={sessionToken}
                    onError={(msg) => setWidgetError(msg)}
                  />
                )}
              </>
            </div>
          )}
        </>
      )}
    </div>
  );
}
