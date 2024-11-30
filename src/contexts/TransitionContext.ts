import { createContext } from 'react';

interface TransitionContextProps {
    completed: boolean;
    toggleCompleted: (completed: boolean) => void;
}

export const TransitionContext = createContext<TransitionContextProps | undefined>(undefined);