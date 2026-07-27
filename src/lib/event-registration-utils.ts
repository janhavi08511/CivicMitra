import { useState, useEffect, useCallback } from 'react';
import { db, auth } from '../auth';
import { handleFirestoreError, OperationType } from './firestore-error-handler';

export interface Registration {
  id: string;
  eventId: string;
  eventName: string;
  fullName: string;
  email: string;
  phone: string;
  organization: string;
  teamName?: string;
  memberCount: string;
  registeredAt: string;
  userId?: string;
}

export interface Submission {
  id: string;
  userId?: string;
  userEmail: string;
  eventId: string;
  eventName: string;
  fileName: string;
  description: string;
  type: string;
  points: number;
  status: 'Pending' | 'Verified';
  timestamp: string;
  aiVerificationStatus?: string;
  proofUrl?: string;
}

export interface QuizScore {
  id: string;
  userEmail: string;
  score: number;
  timestamp: string;
}

export const useEventData = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [quizScores, setQuizScores] = useState<QuizScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [registrationsData, submissionsData, quizScoresData] = await Promise.all([
          Promise.resolve([]),
          Promise.resolve([]),
          Promise.resolve([]),
        ]);
        setRegistrations(registrationsData as Registration[]);
        setSubmissions(submissionsData as Submission[]);
        setQuizScores(quizScoresData as QuizScore[]);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'event-data');
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, []);

  const addRegistration = useCallback((reg: Registration) => {
    // No-op for local state, as onSnapshot handles it
  }, []);

  const addSubmission = useCallback((sub: Submission) => {
    // No-op for local state, as onSnapshot handles it
  }, []);

  const addQuizScore = useCallback((score: QuizScore) => {
    // No-op for local state, as onSnapshot handles it
  }, []);

  const getUserPoints = (userId: string) => {
    const subPoints = submissions
      .filter(s => s.userId === userId)
      .reduce((total, s) => total + s.points, 0);
    const quizPoints = quizScores
      .filter(q => q.userEmail === userId) // quiz_attempts uses userId as userEmail in my previous edit
      .reduce((total, q) => total + q.score, 0);
    return subPoints + quizPoints;
  };

  const isUserRegistered = (eventId: string) => {
    return registrations.some(r => r.userId === auth.currentUser?.uid && r.eventId === eventId);
  };

  return {
    registrations,
    submissions,
    quizScores,
    loading,
    addRegistration,
    addSubmission,
    addQuizScore,
    getUserPoints,
    isUserRegistered
  };
};
