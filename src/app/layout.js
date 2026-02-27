import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "SahulatHub - Verified Household Services",
  description: "Connect with verified service providers for all your household needs in Pakistan.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ProtectedRoute>
            <Layout>
              {children}
            </Layout>
          </ProtectedRoute>
        </AuthProvider>
      </body>
    </html>
  );
}
