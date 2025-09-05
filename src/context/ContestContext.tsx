
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { collection, addDoc, getDocs, query, where, doc, updateDoc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
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
  id?: string;
  participantId: string;
  fileDataUri: string;
  fileName:string;
  adherenceScore?: number;
  rationale?: string;
}

export interface Announcement {
    title: string;
    description: string;
    theme: string;
}

interface ContestContextType {
  participants: Participant[];
  addParticipant: (participant: Omit<Participant, 'id'>) => Promise<{ success: boolean; message: string }>;
  submissions: Submission[];
  addSubmission: (submission: Omit<Submission, 'id' | 'adherenceScore' | 'rationale'>) => Promise<void>;
  updateSubmission: (participantId: string, data: Partial<Submission>) => Promise<void>;
  findSubmissionByParticipantId: (id: string) => Submission | undefined;
  registrationOpen: boolean;
  setRegistrationOpen: (isOpen: boolean) => void;
  activePrompt: GenerateContestPromptOutput | null;
  setActivePrompt: (prompt: GenerateContestPromptOutput | null) => void;
  announcement: Announcement | null;
  updateAnnouncement: (announcement: Announcement) => Promise<void>;
}

// Context
const ContestContext = createContext<ContestContextType | undefined>(undefined);

// Provider
export const ContestProvider = ({ children }: { children: ReactNode }) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [registrationOpen, setRegistrationOpen] = useState(true);
  const [activePrompt, setActivePrompt] = useState<GenerateContestPromptOutput | null>(null);
  const [announcement, setAnnouncement] = useState<Announcement | null>({
    title: "World Tourism Day 2025 Photography Contest",
    description: "The District Administration is pleased to announce a photography contest to celebrate World Tourism Day 2025. Capture the beauty of our district's tourist destinations and win exciting prizes.",
    theme: "Tourism & Green Investments"
  });

  useEffect(() => {
    const unsubParticipants = onSnapshot(collection(db, 'participants'), (snapshot) => {
      const fetchedParticipants = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Participant));
      setParticipants(fetchedParticipants);
    });

    const unsubSubmissions = onSnapshot(collection(db, 'submissions'), (snapshot) => {
        const fetchedSubmissions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Submission));
        setSubmissions(fetchedSubmissions);
    });

    const unsubAnnouncement = onSnapshot(doc(db, 'settings', 'announcement'), (doc) => {
        if (doc.exists()) {
            setAnnouncement(doc.data() as Announcement);
        }
    });

    // Load from local storage
    const storedPrompt = localStorage.getItem('activePrompt');
    if (storedPrompt) {
      setActivePrompt(JSON.parse(storedPrompt));
    }
    const storedRegistrationStatus = localStorage.getItem('registrationOpen');
    if (storedRegistrationStatus) {
        setRegistrationOpen(JSON.parse(storedRegistrationStatus));
    }


    return () => {
        unsubParticipants();
        unsubSubmissions();
        unsubAnnouncement();
    };
  }, []);

  const addParticipant = async (participantData: Omit<Participant, 'id'>) => {
    const q = query(collection(db, 'participants'), where("email", "==", participantData.email));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return { success: false, message: "An account with this email already exists." };
    }
    
    await addDoc(collection(db, 'participants'), participantData);
    return { success: true, message: "Registration successful!" };
  };

  const addSubmission = async (submissionData: Omit<Submission, 'id'| 'adherenceScore' | 'rationale'>) => {
     // Check if submission already exists
    const existing = submissions.find(s => s.participantId === submissionData.participantId);
    if (existing && existing.id) {
        // Update existing document
        const subDocRef = doc(db, 'submissions', existing.id);
        await updateDoc(subDocRef, submissionData);
    } else {
        // Add new document
        await addDoc(collection(db, 'submissions'), submissionData);
    }
  };

  const updateSubmission = async (participantId: string, data: Partial<Submission>) => {
    const submission = submissions.find(s => s.participantId === participantId);
    if (submission && submission.id) {
        const subDocRef = doc(db, 'submissions', submission.id);
        await updateDoc(subDocRef, data);
    }
  }

  const findSubmissionByParticipantId = (id: string) => submissions.find(s => s.participantId === id);
  
  const handleSetRegistrationOpen = (isOpen: boolean) => {
      setRegistrationOpen(isOpen);
      localStorage.setItem('registrationOpen', JSON.stringify(isOpen));
  }

  const handleSetActivePrompt = (prompt: GenerateContestPromptOutput | null) => {
      setActivePrompt(prompt);
      if(prompt) {
          localStorage.setItem('activePrompt', JSON.stringify(prompt));
      } else {
          localStorage.removeItem('activePrompt');
      }
  }

  const updateAnnouncement = async (announcementData: Announcement) => {
      const announcementRef = doc(db, 'settings', 'announcement');
      await setDoc(announcementRef, announcementData);
  }


  const value = {
    participants,
    addParticipant,
    submissions,
    addSubmission,
    updateSubmission,
    findSubmissionByParticipantId,
    registrationOpen,
    setRegistrationOpen: handleSetRegistrationOpen,
    activePrompt,
    setActivePrompt: handleSetActivePrompt,
    announcement,
    updateAnnouncement,
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
