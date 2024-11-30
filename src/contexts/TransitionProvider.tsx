import React, {useState} from "react";
import { TransitionContext } from "./TransitionContext";

export const TransitionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [completed, setCompleted] = useState(false);
    const toggleCompleted = (value: boolean) => {
        setCompleted(value);
    };

    return (
        <TransitionContext.Provider value={{ toggleCompleted, completed }}>
            {children}
        </TransitionContext.Provider>
    );
};