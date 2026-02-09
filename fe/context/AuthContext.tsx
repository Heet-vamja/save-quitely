import React, {
  createContext,
  useState,
  useContext,
  useEffect,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  name: string;
  phone: string;
  upiId?: string;
}

interface AuthSession {
  token: string;
  user: User;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  hasCompletedOnboarding: boolean;

  setSession: (session: AuthSession) => Promise<void>;
  logout: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export const AuthProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] =
    useState(false);

  useEffect(() => {
    restoreSession();
  }, []);

  const restoreSession = async () => {
    try {
      const [storedUser, storedToken, onboardingStatus] =
        await Promise.all([
          AsyncStorage.getItem('user'),
          AsyncStorage.getItem('auth_token'),
          AsyncStorage.getItem('hasCompletedOnboarding'),
        ]);

      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      }

      if (onboardingStatus) {
        setHasCompletedOnboarding(
          JSON.parse(onboardingStatus),
        );
      }
    } catch (err) {
      console.error('Auth restore failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Called AFTER successful verify-otp API
   */
  const setSession = async (session: AuthSession) => {
    await Promise.all([
      AsyncStorage.setItem(
        'auth_token',
        session.token,
      ),
      AsyncStorage.setItem(
        'user',
        JSON.stringify(session.user),
      ),
    ]);

    setToken(session.token);
    setUser(session.user);
  };

  const logout = async () => {
    await Promise.all([
      AsyncStorage.removeItem('auth_token'),
      AsyncStorage.removeItem('user'),
    ]);

    setToken(null);
    setUser(null);
  };

  const completeOnboarding = async () => {
    await AsyncStorage.setItem(
      'hasCompletedOnboarding',
      JSON.stringify(true),
    );
    setHasCompletedOnboarding(true);
  };

  const updateUser = async (userData: Partial<User>) => {
    if (!user) return;

    const updatedUser = { ...user, ...userData };
    await AsyncStorage.setItem(
      'user',
      JSON.stringify(updatedUser),
    );
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        hasCompletedOnboarding,
        setSession,
        logout,
        completeOnboarding,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error(
      'useAuth must be used within an AuthProvider',
    );
  }
  return context;
};
