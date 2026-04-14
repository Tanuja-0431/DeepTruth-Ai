import { createContext, useContext, useState, type ReactNode } from 'react';

interface User {
  id: string;
  name?: string;
  email: string;
  role?: string;
  isProfileComplete: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string) => User;
  logout: () => void;
  completeProfile: (data: Partial<User>) => void;
  freeTrialCount: number;
  incrementTrial: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('deepfake_user');
    return stored ? JSON.parse(stored) : null;
  });

  const [freeTrialCount, setFreeTrialCount] = useState<number>(() => {
    const stored = localStorage.getItem('free_trial_count');
    return stored ? parseInt(stored, 10) : 0;
  });

  const login = (email: string) => {
    // Check if we have a saved profile for this specific email
    const savedProfile = localStorage.getItem(`user_profile_${email}`);
    
    const newUser: User = savedProfile 
      ? JSON.parse(savedProfile) 
      : { 
          id: Math.random().toString(36).substr(2, 9), 
          email, 
          isProfileComplete: localStorage.getItem(`profile_complete_${email}`) === 'true' 
        };

    setUser(newUser);
    localStorage.setItem('deepfake_user', JSON.stringify(newUser));
    return newUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('deepfake_user');
  };

  const completeProfile = (data: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...data, isProfileComplete: true };
      setUser(updatedUser);
      localStorage.setItem('deepfake_user', JSON.stringify(updatedUser));
      localStorage.setItem(`user_profile_${user.email}`, JSON.stringify(updatedUser));
      localStorage.setItem(`profile_complete_${user.email}`, 'true');
    }
  };

  const incrementTrial = () => {
    const nextCount = freeTrialCount + 1;
    setFreeTrialCount(nextCount);
    localStorage.setItem('free_trial_count', nextCount.toString());
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, completeProfile, freeTrialCount, incrementTrial }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
