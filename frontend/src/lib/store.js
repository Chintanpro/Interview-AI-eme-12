import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  
  login: (user, token) => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    set({ user, token, isAuthenticated: true });
  },
  
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  },
  
  updateUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },
}));

export const useInterviewStore = create((set) => ({
  currentSession: null,
  currentQuestion: null,
  questionNumber: 0,
  answers: [],
  isLoading: false,
  evaluation: null,
  showFeedback: false,
  isComplete: false,
  
  setSession: (session) => set({ currentSession: session }),
  setQuestion: (question, number) => set({ currentQuestion: question, questionNumber: number }),
  setLoading: (loading) => set({ isLoading: loading }),
  setEvaluation: (evaluation) => set({ evaluation, showFeedback: true }),
  hideFeedback: () => set({ showFeedback: false, evaluation: null }),
  addAnswer: (answer) => set((state) => ({ answers: [...state.answers, answer] })),
  setComplete: (complete) => set({ isComplete: complete }),
  reset: () => set({
    currentSession: null,
    currentQuestion: null,
    questionNumber: 0,
    answers: [],
    isLoading: false,
    evaluation: null,
    showFeedback: false,
    isComplete: false,
  }),
}));
