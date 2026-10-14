import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Fluently - Học Tiếng Anh Cho Người Mất Gốc | Tự Tin Giao Tiếp Cùng Tây AI',
  description:
    'Web app học tiếng Anh từ con số 0 cho người mất căn bản: 44 âm IPA, mẫu câu phản xạ, flashcards SRS và luyện nói 1-1 với người bản xứ AI.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: '#4f46e5',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning className="h-full antialiased">
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans">
        {children}
      </body>
    </html>
  );
}
