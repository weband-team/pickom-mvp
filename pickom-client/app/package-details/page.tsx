'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import BottomNavigation from '../components/BottomNavigation';

export default function PackageDetailsPage() {
    const [selectedPackageType, setSelectedPackageType] = useState<'small' | 'large' | 'document' | 'other'>('small');
    const [notes, setNotes] = useState('');
    const [preferredDate, setPreferredDate] = useState('');

    const packageTypes = [
        { id: 'small', label: 'Small Parcel', icon: '📦' },
        { id: 'large', label: 'Large Parcel', icon: '📋' },
        { id: 'document', label: 'Document', icon: '📄' },
        { id: 'other', label: 'Other', icon: '📝' }
    ];

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            {/* Status Bar */}
            <div className="flex justify-between items-center px-4 py-2 status-bar-safe text-sm">
                <span className="font-medium">9:41</span>
                <div className="flex items-center gap-1">
                    <div className="flex gap-1">
                        <div className="w-1 h-1 bg-white rounded-full opacity-80"></div>
                        <div className="w-1 h-1 bg-white rounded-full opacity-80"></div>
                        <div className="w-1 h-1 bg-white rounded-full opacity-80"></div>
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                    </div>
                    <svg className="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="white">
                        <path d="M2 17h20v2H2v-2zm1.15-6.05L4 9.47l.85 1.48H5c.55 0 1 .45 1 1s-.45 1-1 1-.45-.45-.45-1zm5.5 2.5H9c.55 0 1-.45 1-1s-.45-1-1-1-.45.45-.45 1z" />
                    </svg>
                    <div className="w-6 h-3 border border-white rounded-sm ml-1">
                        <div className="w-4 h-1.5 bg-white rounded-sm m-0.5"></div>
                    </div>
                </div>
            </div>

            {/* Header */}
            <div className="text-center px-6 py-6">
                <h1 className="text-4xl font-bold mb-2">Pickom</h1>
                <p className="text-gray-400 text-lg">People-Powered Delivery</p>

                <h2 className="text-3xl font-bold mt-8 mb-6">Package Details</h2>
            </div>

            {/* Package Type Selection */}
            <div className="flex-1 px-6 space-y-4 pb-32">
                <div>
                    <h3 className="text-lg font-semibold mb-4">Package Type</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {packageTypes.map((type) => (
                            <button
                                key={type.id}
                                onClick={() => setSelectedPackageType(type.id as any)}
                                className={`p-4 rounded-mobile text-center font-semibold transition-all duration-300 min-h-button flex flex-col items-center justify-center gap-2 tap-highlight-none ${selectedPackageType === type.id
                                        ? 'bg-accent-orange text-white shadow-mobile-lg'
                                        : 'bg-card border border-border text-white hover:bg-gray-700'
                                    }`}
                            >
                                <span className="text-2xl">{type.icon}</span>
                                <span className="text-sm">{type.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Preferred Date */}
                <div className="pt-4">
                    <label className="block text-white text-lg font-semibold mb-3">
                        Preferred Pickup Date
                    </label>
                    <input
                        type="date"
                        value={preferredDate}
                        onChange={(e) => setPreferredDate(e.target.value)}
                        className="form-input"
                        min={new Date().toISOString().split('T')[0]}
                    />
                </div>

                {/* Notes Section */}
                <div className="pt-4">
                    <label className="block text-white text-lg font-semibold mb-3">
                        Additional Notes
                    </label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="form-input h-24 resize-none"
                        placeholder="Any special instructions or details..."
                        maxLength={200}
                    />
                    <p className="text-xs text-secondary mt-1 text-right">
                        {notes.length}/200 characters
                    </p>
                </div>

                {/* Continue Button */}
                <div className="pt-8">
                    <Link
                        href="/ai-matching"
                        className="btn-primary w-full shadow-lg active:scale-95"
                    >
                        Find Travelers
                    </Link>
                </div>
            </div>

            {/* Bottom Navigation */}
            <BottomNavigation />
        </div>
    );
} 