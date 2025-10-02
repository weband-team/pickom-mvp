'use client';

interface LoadingScreenProps {
    isVisible: boolean;
    message?: string;
}

export default function LoadingScreen({
    isVisible,
    message = "Finding the best pickers nearby..."
}: LoadingScreenProps) {
    if (!isVisible) return null;

    return (
        <div
            className="fixed inset-0"
            style={{
                zIndex: 99999,
                backgroundColor: '#1a1a1a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px'
            }}
        >
            {/* Phone Frame */}
            <div style={{
                width: '375px',
                height: '812px',
                background: '#000',
                borderRadius: '40px',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 0 30px rgba(255, 255, 255, 0.1)'
            }}>
                {/* Top Notch */}
                <div style={{
                    position: 'absolute',
                    top: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '134px',
                    height: '5px',
                    background: '#333',
                    borderRadius: '2.5px',
                    zIndex: 1000
                }}></div>

                {/* Page Content */}
                <div style={{
                    height: '100%',
                    minHeight: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    {/* Status Bar */}
                    <div className="status-bar">
                        <span>9:41</span>
                        <div className="status-icons">
                            <div className="flex gap-1">
                                <div className="w-1 h-1 bg-white rounded-full"></div>
                                <div className="w-1 h-1 bg-white rounded-full"></div>
                                <div className="w-1 h-1 bg-white rounded-full"></div>
                                <div className="w-1 h-1 bg-white rounded-full"></div>
                            </div>
                            <svg width="17" height="11" viewBox="0 0 17 11" fill="white">
                                <path d="M1 5.5C1 3.5 2.5 2 4.5 2S8 3.5 8 5.5 6.5 9 4.5 9 1 7.5 1 5.5z" />
                                <path d="M9 5.5C9 3.5 10.5 2 12.5 2S16 3.5 16 5.5 14.5 9 12.5 9 9 7.5 9 5.5z" />
                            </svg>
                            <svg width="24" height="11" viewBox="0 0 24 11" fill="white">
                                <rect x="1" y="1" width="22" height="9" rx="2" stroke="white" strokeWidth="1" fill="none" />
                                <rect x="2" y="2" width="18" height="7" fill="white" />
                            </svg>
                        </div>
                    </div>

                    {/* Content */}
                    <div style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '32px',
                        textAlign: 'center'
                    }}>
                        {/* Top Section - Logo and Title */}
                        <div style={{ marginBottom: '64px' }}>
                            <h1 style={{
                                fontSize: '54px',
                                fontWeight: '700',
                                color: 'white',
                                marginBottom: '8px',
                                textAlign: 'center',
                                letterSpacing: '-0.02em'
                            }}>
                                Pickom
                            </h1>
                            <p style={{
                                fontSize: '18px',
                                color: '#9CA3AF',
                                textAlign: 'center',
                                fontWeight: '400',
                                marginBottom: '0'
                            }}>
                                People-Powered Delivery
                            </p>
                        </div>

                        {/* Middle Section - Loading Message */}
                        <div style={{ marginBottom: '64px' }}>
                            <h2 style={{
                                fontSize: '32px',
                                fontWeight: '600',
                                color: 'white',
                                textAlign: 'center',
                                marginBottom: '40px',
                                lineHeight: '1.2',
                                maxWidth: '300px',
                                margin: '0 auto 40px auto'
                            }}>
                                {message}
                            </h2>

                            {/* Loading Spinner */}
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                <div className="relative" style={{ width: '100px', height: '100px' }}>
                                    {/* Spinner Ring */}
                                    <div
                                        className="absolute inset-0 rounded-full animate-spin"
                                        style={{
                                            background: `conic-gradient(from 0deg, #f97316 0deg, #f97316 270deg, transparent 270deg)`,
                                            animationDuration: '1.5s'
                                        }}
                                    ></div>

                                    {/* Inner circle to create ring effect */}
                                    <div
                                        className="absolute rounded-full bg-black"
                                        style={{
                                            top: '10px',
                                            left: '10px',
                                            right: '10px',
                                            bottom: '10px'
                                        }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Section - Description */}
                        <div>
                            <p style={{
                                fontSize: '18px',
                                color: '#9CA3AF',
                                textAlign: 'center',
                                lineHeight: '1.5',
                                fontWeight: '400',
                                maxWidth: '280px',
                                margin: '0 auto'
                            }}>
                                We&apos;re matching you with the most trusted and available pickers in your area.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Home Indicator */}
                <div style={{
                    position: 'absolute',
                    bottom: '8px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '134px',
                    height: '5px',
                    background: '#666',
                    borderRadius: '2.5px',
                    zIndex: 1000
                }}></div>
            </div>
        </div>
    );
} 