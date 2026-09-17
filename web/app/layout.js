import "./globals.css";

export const metadata = {
  title: "Claims Operations Analytics Platform",
  description:
    "A claims lifecycle analytics platform: dbt Core + DuckDB, 83 CI-gated tests, and a Postgres/Supabase ingestion layer in progress.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
