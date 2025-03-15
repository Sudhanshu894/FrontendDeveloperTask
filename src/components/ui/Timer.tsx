'use client';

import React, { useState, useEffect } from 'react';
import { FiClock } from 'react-icons/fi';

interface TimerProps {
  initialSeconds: number;
  onExpire: () => void;
}

const Timer: React.FC<TimerProps> = ({ initialSeconds, onExpire }) => {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (seconds <= 0) {
      onExpire();
      return;
    }

    const timer = setInterval(() => {
      setSeconds((prevSeconds) => prevSeconds - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds, onExpire]);

  return (
    <div className="timer">
      <FiClock className="mr-1" />
      <span>{seconds} Sec</span>
    </div>
  );
};

export default Timer; 