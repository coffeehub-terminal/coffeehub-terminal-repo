import "./globals.css";
export const metadata = { title: "CoffeeHub", description: "Seller OS" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#FBFBF9] text-[#111] antialiased">{children}</body>
    </html>
  );
}
