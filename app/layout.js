import { AdminAuthProvider } from "../context/AdminAuthContext";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata = {
  title: "PaniHisab - Admin Panel",
  description: "Platform Administration",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 font-sans min-h-screen">
        <Toaster position="top-center" />
        <AdminAuthProvider>{children}</AdminAuthProvider>
      </body>
    </html>
  );
}
