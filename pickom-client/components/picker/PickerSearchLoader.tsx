'use client';

import { useState, useEffect } from 'react';
import styles from './PickerSearchLoader.module.css';

interface PickerSearchLoaderProps {
  onSearchComplete: () => void;
}

export function PickerSearchLoader({ onSearchComplete }: PickerSearchLoaderProps) {
  const [loadingText, setLoadingText] = useState('Searching for pickers...');

  useEffect(() => {
    const textCycle = [
      'Searching for pickers...',
      'Analyzing routes...',
      'Finding best offers...',
      'Almost ready...'
    ];

    let currentIndex = 0;
    const textInterval = setInterval(() => {
      currentIndex = (currentIndex + 1) % textCycle.length;
      setLoadingText(textCycle[currentIndex]);
    }, 800);

    const searchTimeout = setTimeout(() => {
      clearInterval(textInterval);
      onSearchComplete();
    }, 3500);

    return () => {
      clearInterval(textInterval);
      clearTimeout(searchTimeout);
    };
  }, [onSearchComplete]);

  return (
    <div className={styles.loaderContainer}>
      <div>
        <div className={styles.spinnerContainer}>
          <div className={styles.spinner}></div>
          <div className={styles.spinnerReverse}></div>
        </div>

        <h2 className={styles.title}>
          Finding pickers near you
        </h2>

        <p className={styles.text}>
          {loadingText}
        </p>

        <div className={styles.progressContainer}>
          <div className={styles.progressBar}></div>
        </div>
      </div>
    </div>
  );
}