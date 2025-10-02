'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PhoneWrapper from '../components/PhoneWrapper';

export default function RateExperiencePage() {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [packageDelivered, setPackageDelivered] = useState(false);
    const router = useRouter();

    const handleStarClick = (starIndex: number) => {
        setRating(starIndex + 1);
    };

    const handleSubmit = () => {
        console.log('Rating submitted:', { rating, comment, packageDelivered });
        // Можно перенаправить на главную или показать благодарность
        router.push('/');
    };

    return (
        <PhoneWrapper>
            <div className="page">
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
                <div className="content">
                    {/* Header with success icon */}
                    <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                        {/* Success Icon */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            marginBottom: '24px'
                        }}>
                            <div style={{
                                width: '100px',
                                height: '100px',
                                background: 'linear-gradient(135deg, #10b981, #059669)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 20px 40px rgba(16, 185, 129, 0.3)',
                                position: 'relative'
                            }}>
                                <div style={{
                                    fontSize: '48px',
                                    color: 'white'
                                }}>
                                    🎉
                                </div>

                                {/* Floating particles */}
                                <div style={{
                                    position: 'absolute',
                                    top: '-8px',
                                    left: '20px',
                                    width: '8px',
                                    height: '8px',
                                    background: '#f97316',
                                    borderRadius: '50%',
                                    animation: 'float 2s ease-in-out infinite'
                                }}></div>
                                <div style={{
                                    position: 'absolute',
                                    top: '10px',
                                    right: '-5px',
                                    width: '6px',
                                    height: '6px',
                                    background: '#3b82f6',
                                    borderRadius: '50%',
                                    animation: 'float 2s ease-in-out infinite 0.5s'
                                }}></div>
                                <div style={{
                                    position: 'absolute',
                                    bottom: '-5px',
                                    left: '-8px',
                                    width: '10px',
                                    height: '10px',
                                    background: '#f59e0b',
                                    borderRadius: '50%',
                                    animation: 'float 2s ease-in-out infinite 1s'
                                }}></div>
                            </div>
                        </div>

                        <h1 style={{
                            fontSize: '36px',
                            fontWeight: '700',
                            color: 'white',
                            marginBottom: '8px'
                        }}>
                            Pickom
                        </h1>
                        <p style={{
                            fontSize: '16px',
                            color: '#9CA3AF',
                            marginBottom: '0'
                        }}>
                            People-Powered Delivery
                        </p>
                    </div>

                    {/* Package delivered question */}
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.05))',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        borderRadius: '20px',
                        padding: '32px 24px',
                        marginBottom: '32px',
                        textAlign: 'center',
                        animation: 'fadeInUp 0.6s ease-out 0.2s both'
                    }}>
                        <h2 style={{
                            fontSize: '24px',
                            fontWeight: '700',
                            color: 'white',
                            marginBottom: '24px',
                            lineHeight: '1.3'
                        }}>
                            Has the package been delivered?
                        </h2>

                        <button
                            onClick={() => setPackageDelivered(true)}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '16px 32px',
                                background: packageDelivered ?
                                    'linear-gradient(135deg, #10b981, #059669)' :
                                    'rgba(255, 255, 255, 0.08)',
                                border: packageDelivered ?
                                    '2px solid #10b981' :
                                    '2px solid rgba(255, 255, 255, 0.15)',
                                borderRadius: '30px',
                                color: 'white',
                                fontSize: '18px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                boxShadow: packageDelivered ?
                                    '0 8px 25px rgba(16, 185, 129, 0.3)' :
                                    'none'
                            }}
                            onMouseEnter={(e) => {
                                const target = e.target as HTMLButtonElement;
                                if (!packageDelivered) {
                                    target.style.background = 'rgba(255, 255, 255, 0.12)';
                                    target.style.transform = 'translateY(-2px)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                const target = e.target as HTMLButtonElement;
                                if (!packageDelivered) {
                                    target.style.background = 'rgba(255, 255, 255, 0.08)';
                                    target.style.transform = 'translateY(0)';
                                }
                            }}
                        >
                            <span>Yes</span>
                            <div style={{
                                width: '28px',
                                height: '28px',
                                background: packageDelivered ? 'white' : '#10b981',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: packageDelivered ? '#10b981' : 'white',
                                fontSize: '16px',
                                fontWeight: '700',
                                transition: 'all 0.3s ease'
                            }}>
                                ✓
                            </div>
                        </button>
                    </div>

                    {/* Rating section */}
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.1), rgba(234, 88, 12, 0.05))',
                        border: '1px solid rgba(249, 115, 22, 0.2)',
                        borderRadius: '20px',
                        padding: '32px 32px',
                        marginBottom: '24px',
                        textAlign: 'center',
                        animation: 'fadeInUp 0.6s ease-out 0.4s both',
                        overflow: 'hidden'
                    }}>
                        <h3 style={{
                            fontSize: '22px',
                            fontWeight: '700',
                            color: 'white',
                            marginBottom: '24px'
                        }}>
                            Rate your experience:
                        </h3>

                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '8px',
                            marginBottom: '16px',
                            padding: '12px 0'
                        }}>
                            {[0, 1, 2, 3, 4].map((index) => (
                                <button
                                    key={index}
                                    onClick={() => handleStarClick(index)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        fontSize: '40px',
                                        color: index < rating ? '#f97316' : '#374151',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        padding: '12px',
                                        borderRadius: '50%',
                                        position: 'relative',
                                        filter: index < rating ? 'drop-shadow(0 4px 8px rgba(249, 115, 22, 0.4))' : 'none',
                                        width: '56px',
                                        height: '56px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                    onMouseEnter={(e) => {
                                        const target = e.target as HTMLButtonElement;
                                        target.style.transform = 'scale(1.15) rotate(5deg)';
                                        target.style.filter = 'drop-shadow(0 8px 16px rgba(249, 115, 22, 0.6))';
                                    }}
                                    onMouseLeave={(e) => {
                                        const target = e.target as HTMLButtonElement;
                                        target.style.transform = 'scale(1) rotate(0deg)';
                                        target.style.filter = index < rating ? 'drop-shadow(0 4px 8px rgba(249, 115, 22, 0.4))' : 'none';
                                    }}
                                >
                                    ⭐
                                </button>
                            ))}
                        </div>

                        {rating > 0 && (
                            <div style={{
                                fontSize: '16px',
                                color: '#f97316',
                                fontWeight: '600',
                                animation: 'fadeInUp 0.5s ease-out'
                            }}>
                                {rating === 1 && "Poor"}
                                {rating === 2 && "Fair"}
                                {rating === 3 && "Good"}
                                {rating === 4 && "Very Good"}
                                {rating === 5 && "Excellent!"}
                            </div>
                        )}
                    </div>

                    {/* Comment section */}
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03))',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '20px',
                        padding: '24px',
                        marginBottom: '24px',
                        animation: 'fadeInUp 0.6s ease-out 0.6s both'
                    }}>
                        <h3 style={{
                            fontSize: '20px',
                            fontWeight: '700',
                            color: 'white',
                            marginBottom: '16px'
                        }}>
                            💬 Leave a comment
                        </h3>

                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Share your thoughts about the delivery experience... Was the picker friendly? Was the delivery on time? Any suggestions for improvement?"
                            maxLength={300}
                            style={{
                                width: '100%',
                                height: '100px',
                                padding: '20px',
                                background: 'rgba(0, 0, 0, 0.3)',
                                border: '2px solid rgba(255, 255, 255, 0.15)',
                                borderRadius: '16px',
                                color: 'white',
                                fontSize: '16px',
                                resize: 'none',
                                outline: 'none',
                                transition: 'all 0.3s ease',
                                boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)'
                            }}
                            onFocus={(e) => {
                                const target = e.target as HTMLTextAreaElement;
                                target.style.borderColor = '#f97316';
                                target.style.background = 'rgba(0, 0, 0, 0.4)';
                                target.style.boxShadow = 'inset 0 2px 4px rgba(0, 0, 0, 0.1), 0 0 0 3px rgba(249, 115, 22, 0.1)';
                            }}
                            onBlur={(e) => {
                                const target = e.target as HTMLTextAreaElement;
                                target.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                                target.style.background = 'rgba(0, 0, 0, 0.3)';
                                target.style.boxShadow = 'inset 0 2px 4px rgba(0, 0, 0, 0.1)';
                            }}
                        />

                        <div style={{
                            textAlign: 'right',
                            marginTop: '8px',
                            fontSize: '12px',
                            color: '#9CA3AF'
                        }}>
                            {comment.length}/300 characters
                        </div>
                    </div>

                    {/* Submit button */}
                    <button
                        onClick={handleSubmit}
                        style={{
                            width: '100%',
                            padding: '20px',
                            background: (packageDelivered && rating > 0) ?
                                'linear-gradient(135deg, #f97316, #ea580c)' :
                                'rgba(255, 255, 255, 0.08)',
                            border: (packageDelivered && rating > 0) ?
                                '2px solid #f97316' :
                                '2px solid rgba(255, 255, 255, 0.15)',
                            borderRadius: '20px',
                            color: 'white',
                            fontSize: '18px',
                            fontWeight: '700',
                            cursor: (packageDelivered && rating > 0) ? 'pointer' : 'not-allowed',
                            transition: 'all 0.3s ease',
                            opacity: (packageDelivered && rating > 0) ? 1 : 0.5,
                            boxShadow: (packageDelivered && rating > 0) ?
                                '0 10px 30px rgba(249, 115, 22, 0.3)' :
                                'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                            animation: 'fadeInUp 0.6s ease-out 0.8s both'
                        }}
                        disabled={!packageDelivered || rating === 0}
                        onMouseEnter={(e) => {
                            const target = e.target as HTMLButtonElement;
                            if (packageDelivered && rating > 0) {
                                target.style.transform = 'translateY(-3px)';
                                target.style.boxShadow = '0 15px 40px rgba(249, 115, 22, 0.4)';
                                target.style.background = 'linear-gradient(135deg, #ea580c, #dc2626)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            const target = e.target as HTMLButtonElement;
                            if (packageDelivered && rating > 0) {
                                target.style.transform = 'translateY(0)';
                                target.style.boxShadow = '0 10px 30px rgba(249, 115, 22, 0.3)';
                                target.style.background = 'linear-gradient(135deg, #f97316, #ea580c)';
                            }
                        }}
                    >
                        <span>🚀</span>
                        <span>Submit & Complete</span>
                    </button>

                    {/* CSS Animations */}
                    <style jsx>{`
                        @keyframes float {
                            0%, 100% {
                                transform: translateY(0px);
                            }
                            50% {
                                transform: translateY(-8px);
                            }
                        }

                        @keyframes fadeInUp {
                            0% {
                                opacity: 0;
                                transform: translateY(20px);
                            }
                            100% {
                                opacity: 1;
                                transform: translateY(0);
                            }
                        }

                        textarea::placeholder {
                            color: #9CA3AF;
                            opacity: 0.8;
                        }

                        textarea:focus::placeholder {
                            opacity: 0.6;
                        }
                    `}</style>
                </div>
            </div>
        </PhoneWrapper>
    );
} 