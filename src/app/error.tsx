"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 실제 운영 환경에서는 Sentry 등 에러 모니터링 서비스로 전송
    console.error("[FlowDesk] 페이지 오류:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-4 p-8 text-center">
      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
        <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
        </svg>
      </div>
      <div>
        <h2 className="text-lg font-semibold text-zinc-800">데이터를 불러올 수 없습니다</h2>
        <p className="mt-1 text-sm text-zinc-500">
          일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
        </p>
        {error.digest && (
          <p className="mt-1 text-xs text-zinc-400 font-mono">오류 코드: {error.digest}</p>
        )}
      </div>
      <button
        onClick={reset}
        className="px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors"
      >
        다시 시도
      </button>
    </div>
  );
}
