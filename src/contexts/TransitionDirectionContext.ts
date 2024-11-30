import { createContext } from 'react';

interface TransitionDirectionContextProps {
    direction: number;
    toggleDirection: (direction: number) => void;
}

export const TransitionDirectionContext = createContext<TransitionDirectionContextProps | undefined>(undefined);