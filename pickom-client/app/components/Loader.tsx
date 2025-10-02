'use client';

interface LoaderProps {
    isVisible: boolean;
    message?: string;
}

export default function Loader({ isVisible, message = "Loading..." }: LoaderProps) {
    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-900 rounded-xl p-8 flex flex-col items-center max-w-sm mx-4">
                {/* Spinner */}
                <div className="relative mb-6">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-blue-500"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 bg-blue-500 rounded-full opacity-20 animate-pulse"></div>
                    </div>
                </div>

                {/* Message */}
                <p className="text-white text-lg font-medium text-center mb-2">{message}</p>
                <p className="text-gray-400 text-sm text-center">Please wait...</p>

                {/* Progress dots */}
                <div className="flex gap-1 mt-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
            </div>
        </div>
    );
} 