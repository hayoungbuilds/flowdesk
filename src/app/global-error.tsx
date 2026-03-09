"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[FlowDesk] 전역 오류:", error);
  }, [error]);

  return (
    <html lang="ko">
      <body className="antialiased bg-zinc-50">
        <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-800">FlowDesk에 문제가 발생했습니다</h1>
            <p className="mt-2 text-sm text-zinc-500">
              애플리케이션을 불러오는 중 오류가 발생했습니다.
            </p>
          </div>
          <button
            onClick={reset}
            className="px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors"
          >
            앱 재시작
          </button>
        </div>
      </body>
    </html>
  );
}
