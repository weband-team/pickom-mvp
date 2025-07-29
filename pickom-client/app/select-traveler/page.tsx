'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PhoneWrapper from '../components/PhoneWrapper';
import { useLoading } from '../context/LoadingContext';

interface Traveler {
    id: number;
    name: string;
    time: string;
    price: string;
    trust: string;
    rating: number;
    deliveries: number;
    route: string;
    avatar: string;
}

// Generate 50 travelers
const generateTravelers = (): Traveler[] => {
    const firstNames = ['Michael', 'Anna', 'John', 'Ewa', 'David', 'Maria', 'Robert', 'Katarzyna', 'James', 'Agnieszka', 'Thomas', 'Magdalena', 'Daniel', 'Joanna', 'Matthew', 'Barbara', 'Christopher', 'Monika', 'Andrew', 'Paulina'];
    const lastNames = ['K.', 'S.', 'A.', 'W.', 'B.', 'M.', 'L.', 'N.', 'P.', 'T.', 'R.', 'G.', 'H.', 'C.', 'D.', 'F.', 'J.', 'Z.', 'O.', 'V.'];

    // Different time formats like on the screenshot
    const generateTime = (index: number) => {
        const times = [
            '50 min', '55 min', '1 hr 5 min', '42 min', '1 hr 15 min',
            '38 min', '1 hr 2 min', '47 min', '52 min', '1 hr 8 min'
        ];
        return times[index % times.length];
    };

    return Array.from({ length: 50 }, (_, i) => ({
        id: i + 1,
        name: `${firstNames[i % firstNames.length]} ${lastNames[i % lastNames.length]}`,
        time: generateTime(i),
        price: `${20 + Math.floor(Math.random() * 30)} zł`,
        trust: `${85 + Math.floor(Math.random() * 15)}%`,
        rating: 3.5 + Math.random() * 1.5,
        deliveries: 10 + Math.floor(Math.random() * 500),
        route: 'Pickup to Drop-off', // Как на скриншоте
        avatar: firstNames[i % firstNames.length].charAt(0) + lastNames[i % lastNames.length].charAt(0)
    }));
};

export default function SelectTravelerPage() {
    const [currentPage, setCurrentPage] = useState(1);
    const [travelers] = useState<Traveler[]>(generateTravelers());
    const itemsPerPage = 10;
    const router = useRouter();
    const { showLoading, hideLoading } = useLoading();

    const totalPages = Math.ceil(travelers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentTravelers = travelers.slice(startIndex, endIndex);

    const goToPage = (page: number) => {
        setCurrentPage(page);
    };

    const nextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleSelectPicker = async () => {
        showLoading("Confirming your selection...");

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        hideLoading();
        router.push('/confirm-payment');
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
                    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                        <h1 className="title-main">Pickom</h1>
                        <p className="subtitle">People-Powered Delivery</p>
                        <h2 className="title-section">Select a Picker</h2>
                    </div>

                    <div style={{ marginBottom: '16px', paddingLeft: '0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#fff' }}>
                            Best Match ({travelers.length} available)
                        </h3>
                        <div style={{ fontSize: '14px', color: '#999' }}>
                            Page {currentPage} of {totalPages}
                        </div>
                    </div>

                    <div className="space-y-4 pb-safe">
                        {currentTravelers.map((traveler) => (
                            <div key={traveler.id} className="picker-item">
                                <div className="picker-avatar">
                                    {traveler.avatar}
                                </div>

                                <div className="picker-info">
                                    <div className="picker-name">{traveler.name}</div>
                                    <div className="picker-route">{traveler.route}</div>
                                    <div className="picker-trust">
                                        <div className="picker-trust-icon">
                                            ✓
                                        </div>
                                        <span>Trust: {traveler.trust}</span>
                                    </div>
                                </div>

                                <div className="picker-details">
                                    <div className="picker-time">{traveler.time}</div>
                                    <div className="picker-price">{traveler.price}</div>
                                    <button
                                        className="btn-select"
                                        onClick={() => handleSelectPicker()}
                                    >
                                        Select Picker
                                    </button>
                                </div>
                            </div>
                        ))}

                        {/* Pagination */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '12px',
                            marginTop: '32px',
                            paddingBottom: '20px'
                        }}>
                            <button
                                onClick={prevPage}
                                disabled={currentPage === 1}
                                style={{
                                    padding: '8px 16px',
                                    background: currentPage === 1 ? '#374151' : '#f97316',
                                    color: currentPage === 1 ? '#6b7280' : 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                Previous
                            </button>

                            <div style={{ display: 'flex', gap: '4px' }}>
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }

                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => goToPage(pageNum)}
                                            style={{
                                                padding: '8px 12px',
                                                background: currentPage === pageNum ? '#f97316' : '#374151',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                fontSize: '14px',
                                                cursor: 'pointer',
                                                minWidth: '36px',
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                onClick={nextPage}
                                disabled={currentPage === totalPages}
                                style={{
                                    padding: '8px 16px',
                                    background: currentPage === totalPages ? '#374151' : '#f97316',
                                    color: currentPage === totalPages ? '#6b7280' : 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </PhoneWrapper>
    );
} 