'use client';

import { useLoading } from '../context/LoadingContext';
import LoadingScreen from './LoadingScreen';

export default function LoadingWrapper() {
    const { isLoading, message } = useLoading();

    return <LoadingScreen isVisible={isLoading} message={message} />;
} 