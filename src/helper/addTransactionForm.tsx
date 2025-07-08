import React, { useState } from "react";
import { addTransaction } from "../api/api"; // 👈 replace with your actual API function

interface AddTransactionFormProps {
  userId: string;
  accessToken: string;
  onSuccess: () => void;
  onError?: (msg: string) => void;
}

const defaultFormData = {
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
};

const AddTransactionForm: React.FC<AddTransactionFormProps> = ({
  userId,
  accessToken,
  onSuccess,
  onError,
}) => {
  const [formData, setFormData] = useState(defaultFormData);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const amountNum = Number(formData.amount);
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = "Transaction name is required.";
    if (!formData.merchant_name.trim())
      errors.merchant_name = "Merchant name is required.";
    if (!amountNum || amountNum <= 0)
      errors.amount = "Amount must be greater than 0.";
    if (!formData.account_id.trim())
      errors.account_id = "Account ID is required.";
    if (!formData.transaction_id.trim())
      errors.transaction_id = "Transaction ID is required.";
    if (!formData.payment_channel.trim())
      errors.payment_channel = "Payment channel is required.";
    if (!formData.transaction_type.trim())
      errors.transaction_type = "Transaction type is required.";
    if (!formData.personal_finance_category.primary.trim())
      errors.primary = "Primary category is required.";
    if (!formData.personal_finance_category.detailed.trim())
      errors.detailed = "Detailed category is required.";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const clearError = (field: string) => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setSubmitting(true);
    setError("");

    const payload = {
      user_id: userId,
      transactions: [formData],
    };
console.log(payload,'===');

    try {
      await addTransaction(payload);
      setFormData(defaultFormData);
      setFieldErrors({});
      onSuccess();
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail || err?.message || "Failed to add transaction";
      setError(msg);
      onError?.(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        width: "100%",
        maxHeight: "70vh",
        backgroundColor: "#fff",
        borderRadius: "12px",
        boxShadow: "0 0 2px rgba(0,0,0,0.2)",
        margin: "auto",
        zIndex: 9998,
        padding: "0",
        overflowY: "auto",
      }}
    >
      <h2
        style={{
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
        }}
      >
        Add New Transaction
      </h2>
      <div style={{ padding: "8px 16px" }}>
        {error && (
          <p style={{ color: "red", fontSize: "12px", fontWeight: "400" }}>
            {error}
          </p>
        )}

        {/* Transaction Name & Merchant Name */}
        <FieldRow>
          <Field
            label="Transaction Name"
            value={formData.name}
            onChange={(v) => {
              setFormData({ ...formData, name: v });
              clearError("name");
            }}
            error={fieldErrors.name}
          />
          <Field
            label="Merchant Name"
            value={formData.merchant_name}
            onChange={(v) => {
              setFormData({ ...formData, merchant_name: v });
              clearError("merchant_name");
            }}
            error={fieldErrors.merchant_name}
          />
        </FieldRow>

        {/* Amount & Account ID */}
        <FieldRow>
          <Field
            label="Amount"
            value={formData.amount}
            type="text"
             
            onChange={(v: string) => {
              // Allow empty input
              if (v === "") {
                setFormData({ ...formData, amount: "" });
                clearError("amount");
                return;
              }
          
              // Regex: start with optional digits, optional single decimal, optional digits after decimal
              const valid = /^(\d+(\.\d*)?|\.\d*)$/;
          
              if (valid.test(v)) {
                setFormData({ ...formData, amount: v });
                clearError("amount");
              }
            }}
      
            error={fieldErrors.amount}
          />
          <Field
            label="Account ID"
            value={formData.account_id}
            onChange={(v) => {
              setFormData({ ...formData, account_id: v });
              clearError("account_id");
            }}
            error={fieldErrors.account_id}
          />
        </FieldRow>

        {/* Transaction ID & Payment Channel */}
        <FieldRow>
          <Field
            label="Transaction ID"
            value={formData.transaction_id}
            onChange={(v) => {
              setFormData({ ...formData, transaction_id: v });
              clearError("transaction_id");
            }}
            error={fieldErrors.transaction_id}
          />
          <Field
            label="Payment Channel"
            value={formData.payment_channel}
            onChange={(v) => {
              setFormData({ ...formData, payment_channel: v });
              clearError("payment_channel");
            }}
            error={fieldErrors.payment_channel}
          />
        </FieldRow>

        {/* Transaction Type & ISO Currency Code */}
        <FieldRow>
          <Field
            label="Transaction Type"
            value={formData.transaction_type}
            onChange={(v) => {
              setFormData({ ...formData, transaction_type: v });
              clearError("transaction_type");
            }}
            error={fieldErrors.transaction_type}
          />
          <Field
            label="Currency Code (ISO)"
            value={formData.iso_currency_code}
            onChange={(v) =>
              setFormData({ ...formData, iso_currency_code: v })
            }
          />
        </FieldRow>

        {/* Primary & Detailed Category */}
        <FieldRow>
          <Field
            label="Primary Category"
            value={formData.personal_finance_category.primary}
            onChange={(v) => {
              setFormData({
                ...formData,
                personal_finance_category: {
                  ...formData.personal_finance_category,
                  primary: v,
                },
              });
              clearError("primary");
            }}
            error={fieldErrors.primary}
          />
          <Field
            label="Detailed Category"
            value={formData.personal_finance_category.detailed}
            onChange={(v) => {
              setFormData({
                ...formData,
                personal_finance_category: {
                  ...formData.personal_finance_category,
                  detailed: v,
                },
              });
              clearError("detailed");
            }}
            error={fieldErrors.detailed}
          />
        </FieldRow>

        {/* Action buttons */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginTop: "20px",
            marginBottom: "20px",
            gap: "10px",
          }}
        >
          <button
            disabled={submitting}
            onClick={onSuccess}
            style={cancelButtonStyle}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={submitButtonStyle}
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddTransactionForm;

// ------------------------
// Reusable Field Components
// ------------------------

const FieldRow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      display: "flex",
      gap: "16px",
      marginBottom: "12px",
      flexWrap: "wrap",
    }}
  >
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
// Reusable Styles
// ------------------------

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
  marginRight: 8,
  cursor: "pointer",
};
