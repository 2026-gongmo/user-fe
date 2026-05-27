import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { AccessProfile, UserProfile } from '../types';

export interface AuthUser {
  profile: UserProfile;
  access: AccessProfile;
}

interface MockAccount extends AuthUser {
  password: string;
}

// 데모용 mock 계정 (test01: 일반 학생/도움 제공자, test02: 장애 학생/도움 이용자)
const MOCK_ACCOUNTS: MockAccount[] = [
  {
    password: '1234',
    profile: {
      id: 'u-1042',
      name: '홍길동',
      university: '한빛대학교',
      major: '컴퓨터공학과 3학년',
      email: 'test01@ac.kr',
      emailVerified: true,
      bio: '함께 걷는 캠퍼스를 만들고 싶어요. 휠체어 이동 보조와 필기를 도와줄 수 있어요.',
      badge: '활동왕',
      interests: ['독서', '음악', '운동', '코딩'],
      role: 'helper',
      mannerScore: 4.9,
    },
    access: {
      needs: [],
      offers: ['mobility-help', 'note'],
    },
  },
  {
    password: '1234',
    profile: {
      id: 'u-2018',
      name: '박지유',
      university: '한빛대학교',
      major: '사회학과 2학년',
      email: 'test02@ac.kr',
      emailVerified: true,
      bio: '캠퍼스 곳곳에서 함께 다닐 동행을 찾고 있어요. 잘 부탁드려요!',
      badge: '새내기',
      interests: ['독서', '카페투어', '글쓰기'],
      role: 'requester',
      mannerScore: 5.0,
    },
    access: {
      needs: ['mobility'],
      offers: [],
    },
  },
];

interface AuthContextValue {
  user: AuthUser | null;
  login: (email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
  isHelper: boolean;
  isRequester: boolean;
}

const STORAGE_KEY = 'beff-auth-v1';

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser());

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (user) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    else window.localStorage.removeItem(STORAGE_KEY);
  }, [user]);

  const login = useCallback((email: string, password: string) => {
    const account = MOCK_ACCOUNTS.find(
      (a) => a.profile.email.toLowerCase() === email.trim().toLowerCase(),
    );
    if (!account) return { ok: false, error: '등록되지 않은 이메일이에요.' };
    if (account.password !== password) {
      return { ok: false, error: '비밀번호가 일치하지 않아요.' };
    }
    setUser({ profile: account.profile, access: account.access });
    return { ok: true };
  }, []);

  const logout = useCallback(() => setUser(null), []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      login,
      logout,
      isHelper: user?.profile.role === 'helper',
      isRequester: user?.profile.role === 'requester',
    }),
    [user, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}

export const TEST_ACCOUNTS = MOCK_ACCOUNTS.map(({ profile, access }, idx) => ({
  email: profile.email,
  password: '1234',
  label: `테스트 계정 ${idx + 1}`,
  hint:
    profile.role === 'helper'
      ? '동행을 제공하는 화면을 볼 수 있어요'
      : '동선 추천과 동행 요청 화면을 볼 수 있어요',
  name: profile.name,
  role: profile.role,
  needs: access.needs,
  offers: access.offers,
}));
