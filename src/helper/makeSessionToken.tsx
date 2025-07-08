// export interface MakeSessionTokenParams {
//   userId: string;
//   access_token: string;
//   setLoading?: (loading: boolean) => void;
//   setError?: (error: string) => void;
//   onError?: (message: string) => void;
//   onSuccess: (sessionToken: string) => void;
// }
// export const makeSessionToken = async ({
//     userId,
//     access_token,
//     setLoading,
//     setError,
//     onError,
//     onSuccess,
//   }: MakeSessionTokenParams): Promise<void> => {
//     try {
//       setLoading?.(true);
//       setError?.("");
//       const API_BASE_URL = "https://dev-categorization.musetax.com/v2/api";

//       const response = await fetch(
//         `${API_BASE_URL}/widgets/session`, // or hard‑code the base URL
//         {
//           method: "POST",
//           headers: {
//             Accept: "application/json",
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${access_token}`,
//           },
//           body: JSON.stringify({
//             user_id: userId,
//             domain_urls: [`${window.location.origin}/`],
//           }),
//         }
//       );
  
//       // If the call itself failed, surface the error detail (if any)
//       if (!response.ok) {
//         let errMsg = `HTTP ${response.status}`;
//         try {
//           const errBody = await response.json();
//           errMsg = errBody?.detail ?? errMsg;
//         } catch {
//           /* ignore JSON‑parse errors */
//         }
//         setError?.(errMsg);
//         onError?.(errMsg);
//         return;
//       }
  
//       // Successful – parse the JSON body
//       const data: { widget_session_token?: string; detail?: string } =
//         await response.json();
//   console.log(data,'datadatadatadatadata');
  
//       if (data.widget_session_token) {
//         onSuccess(data.widget_session_token);
//       } else {
//         const errorMsg = data?.detail || "Invalid session token response";
//         setError?.(errorMsg);
//         onError?.(errorMsg);
//       }
//     } catch (err: unknown) {
//       const msg =
//         err instanceof Error
//           ? err.message
//           : "Unknown error while fetching session token";
//       setError?.(msg);
//       onError?.(msg);
//     } finally {
//       setLoading?.(false);
//     }
//   };
  

import { toast } from "react-toastify";
import { api } from "../api/api";
 
export interface MakeSessionTokenParams {
  userId: string;
  access_token: string;
  setLoading?: (loading: boolean) => void;
  setError?: (error: string) => void;
  onError?: (message: string) => void;
  onSuccess: (sessionToken: string) => void;
}

export const makeSessionToken = async ({
  userId,
  access_token,
  setLoading,
  setError,
  onError,
  onSuccess,
}: MakeSessionTokenParams): Promise<void> => {
  try {
    setLoading?.(true);
    setError?.("");

    const response = await api.post(
      "/widgets/session",
      {
        user_id: userId,
        domain_urls: [`${window.location.origin}/`],
      },
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    console.log(response.data, "makeSessionToken response");

    const { widget_session_token, detail } = response.data;

    if (widget_session_token) {
      onSuccess(widget_session_token);
      toast.success("Session token created successfully.", { toastId: "session-token" });
    } else {
      const errorMsg = detail || "Invalid session token response";
      setError?.(errorMsg);
      onError?.(errorMsg);
      toast.error(errorMsg, { toastId: "session-token-error" });
    }
  } catch (error: any) {
    const msg =
      error?.response?.data?.detail ??
      (error instanceof Error ? error.message : "Unknown error while fetching session token");
    setError?.(msg);
    onError?.(msg);
    toast.error(msg, { toastId: "session-token-error" });
    console.error("Failed to make session token:", error);
  } finally {
    setLoading?.(false);
  }
};
