import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, AlertTriangle } from 'lucide-react';

interface ExamCountdownProps {
  examDate?: string;
  className?: string;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

const ExamCountdown: React.FC<ExamCountdownProps> = ({ examDate, className = '' }) => {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false
  });

  useEffect(() => {
    if (!examDate) return;

    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      const examTime = new Date(examDate).getTime();
      const difference = examTime - now;

      if (difference <= 0) {
        setTimeRemaining({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true
        });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeRemaining({
        days,
        hours,
        minutes,
        seconds,
        isExpired: false
      });
    };

    // Calculate immediately
    calculateTimeRemaining();

    // Update every second
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [examDate]);

  if (!examDate) {
    return (
      <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center space-x-3">
          <Calendar className="w-5 h-5 text-blue-600" />
          <div>
            <h3 className="font-medium text-blue-900">Schedule Your Exam</h3>
            <p className="text-sm text-blue-700">
              Set your exam date to track your preparation progress in{' '}
              <Link 
                to="/settings" 
                className="text-blue-600 hover:text-blue-800 underline font-medium"
              >
                settings
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getUrgencyColor = () => {
    if (timeRemaining.isExpired) return 'red';
    if (timeRemaining.days <= 3) return 'red';
    if (timeRemaining.days <= 7) return 'orange';
    if (timeRemaining.days <= 14) return 'yellow';
    return 'green';
  };

  const urgencyColor = getUrgencyColor();
  const colorClasses = {
    red: 'bg-red-50 border-red-200 text-red-900',
    orange: 'bg-orange-50 border-orange-200 text-orange-900',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    green: 'bg-green-50 border-green-200 text-green-900'
  };

  const iconColorClasses = {
    red: 'text-red-600',
    orange: 'text-orange-600',
    yellow: 'text-yellow-600',
    green: 'text-green-600'
  };

  if (timeRemaining.isExpired) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center space-x-3">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <div>
            <h3 className="font-medium text-red-900">Exam Date Passed</h3>
            <p className="text-sm text-red-700">
              Your scheduled exam was on {formatDate(examDate)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`border rounded-lg p-4 ${colorClasses[urgencyColor]} ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Clock className={`w-5 h-5 ${iconColorClasses[urgencyColor]}`} />
          <div>
            <h3 className="font-medium">Exam Countdown</h3>
            <p className="text-sm opacity-75">
              Scheduled for {formatDate(examDate)}
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="flex items-center space-x-4">
            {timeRemaining.days > 0 && (
              <div className="text-center">
                <div className="text-2xl font-bold">{timeRemaining.days}</div>
                <div className="text-xs opacity-75">
                  {timeRemaining.days === 1 ? 'Day' : 'Days'}
                </div>
              </div>
            )}
            {(timeRemaining.days > 0 || timeRemaining.hours > 0) && (
              <div className="text-center">
                <div className="text-2xl font-bold">{timeRemaining.hours}</div>
                <div className="text-xs opacity-75">
                  {timeRemaining.hours === 1 ? 'Hour' : 'Hours'}
                </div>
              </div>
            )}
            {timeRemaining.days === 0 && (
              <>
                <div className="text-center">
                  <div className="text-2xl font-bold">{timeRemaining.minutes}</div>
                  <div className="text-xs opacity-75">Min</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{timeRemaining.seconds}</div>
                  <div className="text-xs opacity-75">Sec</div>
                </div>
              </>
            )}
          </div>
          
          {timeRemaining.days <= 7 && (
            <div className="mt-2 text-sm font-medium">
              {timeRemaining.days <= 3 ? '🔥 Final Sprint!' : '⚡ Crunch Time!'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamCountdown;
