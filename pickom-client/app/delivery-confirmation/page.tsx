'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNavigation from '../components/BottomNavigation';

export default function DeliveryConfirmationPage() {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isDelivered, setIsDelivered] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const handleStarClick = (starIndex: number) => {
        setRating(starIndex + 1);
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Show success message
        alert('Thank you for your feedback! Your delivery has been completed successfully.');

        // Redirect to home page
        router.push('/');
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            {/* Status Bar */}
            <div className="flex justify-between items-center p-4 pt-12 text-sm">
                <span>9:41</span>
                <div className="flex items-center gap-1">
                    <div className="flex gap-1">
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                    </div>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="white">
                        <path d="M2 17h20v2H2v-2zm1.15-6.05L4 9.47l.85 1.48H5c.55 0 1 .45 1 1s-.45 1-1 1-.45-.45-.45-1zm5.5 2.5H9c.55 0 1-.45 1-1s-.45-1-1-1-.45.45-.45 1z" />
                    </svg>
                    <div className="w-6 h-3 border border-white rounded-sm">
                        <div className="w-4 h-1.5 bg-white rounded-sm m-0.5"></div>
                    </div>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="white">
                        <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2Z" />
                    </svg>
                </div>
            </div>

            {/* Header */}
            <div className="text-center px-8 mb-12">
                <div className="flex justify-center mb-8">
                    <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center">
                        <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>

                <h1 className="text-4xl font-bold mb-2">Pickom</h1>
                <p className="text-gray-400 text-lg">People-Powered Delivery</p>
            </div>

            {/* Main Content */}
            <div className="flex-1 px-8 pb-20">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold mb-6">Has the package been delivered?</h2>

                    <button
                        onClick={() => setIsDelivered(true)}
                        className={`inline-flex items-center space-x-2 px-6 py-3 rounded-full transition-all ${isDelivered
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-800 text-white border border-gray-600'
                            }`}
                    >
                        <span>Yes</span>
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center ml-2">
                            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </button>
                </div>

                {/* Rating Section */}
                <div className="text-center mb-8">
                    <h3 className="text-xl font-medium mb-6">Rate your experience:</h3>

                    {/* Star Rating */}
                    <div className="flex justify-center space-x-2 mb-8">
                        {[0, 1, 2, 3, 4].map((index) => (
                            <button
                                key={index}
                                onClick={() => handleStarClick(index)}
                                className="transition-colors"
                            >
                                <svg
                                    className={`w-10 h-10 ${index < rating ? 'text-yellow-400' : 'text-gray-600'
                                        }`}
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                >
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                </svg>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Comment Section */}
                <div className="mb-8">
                    <h3 className="text-xl font-medium mb-4 text-center">Leave a comment</h3>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-4 text-white placeholder-gray-400 text-lg h-24 resize-none"
                        placeholder="Tell us about your experience..."
                    />
                </div>

                {/* Submit Button */}
                <div className="pt-8">
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="w-full bg-gray-800 text-white py-4 rounded-full text-lg font-medium text-center hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <div className="flex items-center justify-center space-x-2">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Submitting...</span>
                            </div>
                        ) : (
                            'Submit & Complete'
                        )}
                    </button>
                </div>
            </div>

            {/* Bottom Navigation */}
            <BottomNavigation />
        </div>
    );
} 