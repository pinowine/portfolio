import { useContext } from 'react';
import { TransitionDirectionContext } from '../contexts/TransitionDirectionContext';

export const useTransitionDirection = () => {
    const context = useContext(TransitionDirectionContext);
    if (!context) {
        throw new Error('useTransitionDirection must be used within a TransitionDirectionProvider');
    }
    return context;
};