'use client';

import { Toaster } from 'react-hot-toast';

export default function Toast() {
    return (
        <Toaster
            position="top-center"
            reverseOrder={false}
            gutter={8}
            containerClassName=""
            containerStyle={{}}
            toastOptions={{
                className: '',
                duration: 4000,
                style: {
                    background: '#1f2937',
                    color: '#fff',
                    border: '1px solid #374151',
                    borderRadius: '12px',
                    padding: '16px',
                    fontSize: '14px',
                    fontWeight: '500',
                },
                success: {
                    style: {
                        background: '#059669',
                        color: '#fff',
                    },
                },
                error: {
                    style: {
                        background: '#dc2626',
                        color: '#fff',
                    },
                },
            }}
        />
    );
} 