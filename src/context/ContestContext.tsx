"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { GenerateContestPromptOutput } from '@/ai/flows/automated-prompt-generation';

// Types
export interface Participant {
  id: string;
  name: string;
  email: string;
  profession: string;
  gender: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  profilePhotoUrl?: string;
}

export interface Submission {
  participantId: string;
  fileDataUri: string;
  fileName: string;
  adherenceScore?: number;
  rationale?: string;
}

interface ContestContextType {
  participants: Participant[];
  addParticipant: (participant: Omit<Participant, 'id'>) => { success: boolean; message: string };
  submissions: Submission[];
  addSubmission: (submission: Omit<Submission, 'adherenceScore' | 'rationale'>) => void;
  updateSubmission: (participantId: string, data: Partial<Submission>) => void;
  findSubmissionByParticipantId: (id: string) => Submission | undefined;
  registrationOpen: boolean;
  setRegistrationOpen: (isOpen: boolean) => void;
  activePrompt: GenerateContestPromptOutput | null;
  setActivePrompt: (prompt: GenerateContestPromptOutput | null) => void;
}

// Context
const ContestContext = createContext<ContestContextType | undefined>(undefined);

// Provider
export const ContestProvider = ({ children }: { children: ReactNode }) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [registrationOpen, setRegistrationOpen] = useState(true);
  const [activePrompt, setActivePrompt] = useState<GenerateContestPromptOutput | null>(null);

  const addParticipant = (participantData: Omit<Participant, 'id'>) => {
    if (participants.some(p => p.email === participantData.email)) {
      return { success: false, message: "An account with this email already exists." };
    }
    const newParticipant: Participant = {
      ...participantData,
      id: `p${participants.length + 1}`,
    };
    setParticipants(prev => [...prev, newParticipant]);
    return { success: true, message: "Registration successful!" };
  };

  const addSubmission = (submissionData: Omit<Submission, 'adherenceScore' | 'rationale'>) => {
    const newSubmission: Submission = {
      ...submissionData,
    };
    setSubmissions(prev => [...prev.filter(s => s.participantId !== newSubmission.participantId), newSubmission]);
  };

  const updateSubmission = (participantId: string, data: Partial<Submission>) => {
    setSubmissions(prev => prev.map(s => s.participantId === participantId ? {...s, ...data} : s));
  }

  const findSubmissionByParticipantId = (id: string) => submissions.find(s => s.participantId === id);


  const value = {
    participants,
    addParticipant,
    submissions,
    addSubmission,
    updateSubmission,
    findSubmissionByParticipantId,
    registrationOpen,
    setRegistrationOpen,
    activePrompt,
    setActivePrompt,
  };

  return (
    <ContestContext.Provider value={value}>
      {children}
    </ContestContext.Provider>
  );
};

// Hook
export const useContest = () => {
  const context = useContext(ContestContext);
  if (context === undefined) {
    throw new Error('useContest must be used within a ContestProvider');
  }
  return context;
};
