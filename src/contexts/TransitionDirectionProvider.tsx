import React, {useState} from "react";
import { TransitionDirectionContext } from "./TransitionDirectionContext";

export const TransitionDirectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [direction, setDirection] = useState(1);
    const toggleDirection = (value: number) => {
        setDirection(value);
    };

    return (
        <TransitionDirectionContext.Provider value={{ toggleDirection, direction }}>
            {children}
        </TransitionDirectionContext.Provider>
    );
};