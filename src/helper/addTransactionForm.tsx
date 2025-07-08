import React, { useState } from "react";
import { addTransaction } from "../api/api";

interface AddTransactionFormProps {
  userId: string;
  accessToken: string;
  onSuccess: () => void;
  onError?: (msg: string) => void;
}

const createDefaultFormData = () => ({
  account_id: "",
  amount: "",
  iso_currency_code: "USD",
  datetime: new Date().toISOString(),
  date: new Date().toISOString(),
  name: "",
  merchant_name: "",
  payment_channel: "",
  transaction_id: "",
  transaction_type: "",
  personal_finance_category: {
    primary: "",
    detailed: "",
  },
});

const AddTransactionForm: React.FC<AddTransactionFormProps> = ({
  userId,
  accessToken,
  onSuccess,
  onError,
}) => {
  const [transactions, setTransactions] = useState([createDefaultFormData()]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errors: Record<string, string> = {};
    let isValid = true;

    transactions.forEach((t, index) => {
      if (!t.name.trim()) {
        errors[`name-${index}`] = "Transaction name is required.";
        isValid = false;
      }
      if (!t.merchant_name.trim()) {
        errors[`merchant_name-${index}`] = "Merchant name is required.";
        isValid = false;
      }
      if (!t.account_id.trim()) {
        errors[`account_id-${index}`] = "Account ID is required.";
        isValid = false;
      }
      if (!t.transaction_id.trim()) {
        errors[`transaction_id-${index}`] = "Transaction ID is required.";
        isValid = false;
      }
      if (!t.payment_channel.trim()) {
        errors[`payment_channel-${index}`] = "Payment channel is required.";
        isValid = false;
      }
      if (!t.transaction_type.trim()) {
        errors[`transaction_type-${index}`] = "Transaction type is required.";
        isValid = false;
      }
      if (!t.personal_finance_category.primary.trim()) {
        errors[`primary-${index}`] = "Primary category is required.";
        isValid = false;
      }
      if (!t.personal_finance_category.detailed.trim()) {
        errors[`detailed-${index}`] = "Detailed category is required.";
        isValid = false;
      }
      if (!Number(t.amount) || Number(t.amount) <= 0) {
        errors[`amount-${index}`] = "Amount must be greater than 0.";
        isValid = false;
      }
    });

    setFieldErrors(errors);
    return isValid;
  };

  const clearError = (field: string) => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const removeTransaction = (index: number) => {
    setTransactions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setSubmitting(true);
    setError("");

    const payload = {
      user_id: userId,
      transactions,
    };

    try {
      await addTransaction(payload);
      setTransactions([createDefaultFormData()]);
      setFieldErrors({});
      onSuccess();
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail || err?.message || "Failed to add transactions";
      setError(msg);
      onError?.(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={containerStyle as React.CSSProperties}>
      <h2 style={headerStyle}>Add Transactions</h2>
      <div style={{ padding: "8px 16px" }}>
        {error && <p style={{ color: "red", fontSize: "12px" }}>{error}</p>}

        {transactions.map((formData, index) => (
          <div
            key={index}
            style={{
              border: "1px solid #ccc",
              borderRadius: 8,
              padding: 12,
              marginBottom: 24,
              background: "#FAFAFA",
            }}
          >
            <FieldRow>
              <Field
                label="Transaction Name"
                value={formData.name}
                onChange={(v) => {
                  const updated = [...transactions];
                  updated[index].name = v;
                  setTransactions(updated);
                  clearError(`name-${index}`);
                }}
                error={fieldErrors[`name-${index}`]}
              />
              <Field
                label="Merchant Name"
                value={formData.merchant_name}
                onChange={(v) => {
                  const updated = [...transactions];
                  updated[index].merchant_name = v;
                  setTransactions(updated);
                  clearError(`merchant_name-${index}`);
                }}
                error={fieldErrors[`merchant_name-${index}`]}
              />
            </FieldRow>

            <FieldRow>
              <Field
                label="Amount"
                value={formData.amount}
                onChange={(v) => {
                  if (v === "") {
                    const updated = [...transactions];
                    updated[index].amount = "";
                    setTransactions(updated);
                    clearError(`amount-${index}`);
                    return;
                  }
                  const valid = /^(\d+(\.\d*)?|\.\d*)$/;
                  if (valid.test(v)) {
                    const updated = [...transactions];
                    updated[index].amount = v;
                    setTransactions(updated);
                    clearError(`amount-${index}`);
                  }
                }}
                error={fieldErrors[`amount-${index}`]}
              />
              <Field
                label="Account ID"
                value={formData.account_id}
                onChange={(v) => {
                  const updated = [...transactions];
                  updated[index].account_id = v;
                  setTransactions(updated);
                  clearError(`account_id-${index}`);
                }}
                error={fieldErrors[`account_id-${index}`]}
              />
            </FieldRow>

            <FieldRow>
              <Field
                label="Transaction ID"
                value={formData.transaction_id}
                onChange={(v) => {
                  const updated = [...transactions];
                  updated[index].transaction_id = v;
                  setTransactions(updated);
                  clearError(`transaction_id-${index}`);
                }}
                error={fieldErrors[`transaction_id-${index}`]}
              />
              <Field
                label="Payment Channel"
                value={formData.payment_channel}
                onChange={(v) => {
                  const updated = [...transactions];
                  updated[index].payment_channel = v;
                  setTransactions(updated);
                  clearError(`payment_channel-${index}`);
                }}
                error={fieldErrors[`payment_channel-${index}`]}
              />
            </FieldRow>

            <FieldRow>
              <Field
                label="Transaction Type"
                value={formData.transaction_type}
                onChange={(v) => {
                  const updated = [...transactions];
                  updated[index].transaction_type = v;
                  setTransactions(updated);
                  clearError(`transaction_type-${index}`);
                }}
                error={fieldErrors[`transaction_type-${index}`]}
              />
              <Field
                label="Currency Code (ISO)"
                value={formData.iso_currency_code}
                onChange={(v) => {
                  const updated = [...transactions];
                  updated[index].iso_currency_code = v;
                  setTransactions(updated);
                }}
              />
            </FieldRow>

            <FieldRow>
              <Field
                label="Primary Category"
                value={formData.personal_finance_category.primary}
                onChange={(v) => {
                  const updated = [...transactions];
                  updated[index].personal_finance_category.primary = v;
                  setTransactions(updated);
                  clearError(`primary-${index}`);
                }}
                error={fieldErrors[`primary-${index}`]}
              />
              <Field
                label="Detailed Category"
                value={formData.personal_finance_category.detailed}
                onChange={(v) => {
                  const updated = [...transactions];
                  updated[index].personal_finance_category.detailed = v;
                  setTransactions(updated);
                  clearError(`detailed-${index}`);
                }}
                error={fieldErrors[`detailed-${index}`]}
              />
            </FieldRow>

            {transactions.length > 1 && (
              <button
                onClick={() => removeTransaction(index)}
                style={{
                  color: "red",
                  marginTop: 8,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Remove
              </button>
            )}
          </div>
        ))}

        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <button
            onClick={() =>
              setTransactions([...transactions, createDefaultFormData()])
            }
            style={{ ...submitButtonStyle, backgroundColor: "#4CAF50" }}
          >
            + Add Another
          </button>
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
          <button disabled={submitting} onClick={onSuccess} style={cancelButtonStyle}>
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={submitting} style={submitButtonStyle}>
            {submitting ? "Submitting..." : "Submit All"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddTransactionForm;

// ------------------------
// Reusable Components
// ------------------------

const FieldRow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ display: "flex", gap: "16px", marginBottom: "12px", flexWrap: "wrap" }}>
    {children}
  </div>
);

interface FieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  error?: string;
  type?: string;
}

const Field: React.FC<FieldProps> = ({ label, value, onChange, error, type = "text" }) => (
  <div style={{ width: "49%" }}>
    <label style={labelStyle}>{label}</label>
    <input
      type={type}
      placeholder={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={inputStyle}
    />
    {error && <p style={errorStyle}>{error}</p>}
  </div>
);

// ------------------------
// Styles
// ------------------------

const containerStyle = {
  width: "100%",
  maxHeight: "70vh",
  backgroundColor: "#fff",
  borderRadius: "12px",
  boxShadow: "0 0 2px rgba(0,0,0,0.2)",
  margin: "auto",
  zIndex: 9998,
  padding: "0",
  overflowY: "auto",
};

const headerStyle = {
  fontSize: "1.125rem",
  fontWeight: "500",
  color: "#042567",
  margin: "0px",
  backgroundColor: "#F1F7FB",
  padding: "16px 24px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  borderBottom: "1px solid #BFDBFE",
  marginBottom: "18px",
};

const labelStyle = {
  fontSize: "14px",
  fontWeight: "500",
  color: "#042567",
  marginBottom: "5px",
  display: "block",
};

const inputStyle = {
  width: "calc(100% - 35px)",
  padding: "10px 16px",
  border: "1px solid #E6E7EA",
  borderRadius: "10px",
  fontSize: "0.875rem",
  color: "#042567",
  outline: "none",
};

const errorStyle = {
  color: "red",
  fontSize: "12px",
  fontWeight: "400",
};

const cancelButtonStyle = {
  border: "1px solid #5387F1",
  backgroundColor: "white",
  color: "#5387F1",
  fontSize: "0.875rem",
  fontWeight: 500,
  padding: "8px 16px",
  borderRadius: 8,
  cursor: "pointer",
};

const submitButtonStyle = {
  backgroundColor: "#5387F1",
  border: "1px solid #5387F1",
  color: "white",
  fontSize: "0.875rem",
  fontWeight: 500,
  padding: "8px 16px",
  borderRadius: 8,
  cursor: "pointer",
};
