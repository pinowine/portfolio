import React from 'react';

import { SwitcherProps } from "../types/switcher";
import classNames from 'classnames';

const Switcher: React.FC<SwitcherProps> = ({ toggleEvent, imgLeft: ImgLeft, imgRight: ImgRight, label, disabled, checked, imgLeftColor, imgRightColor }) => {
    const getColorClass = (type: string, color: string, level: number) => {
        return `${type}-${color}-${level}`;
    };
    
    const imageLeftColor = getColorClass('text',imgLeftColor, 600);
    const imageRightColor = getColorClass('text',imgRightColor, 400);
    
    return (
        <button 
            className={classNames(
                `relative inline-flex items-center py-1.5 px-2 transition-colors duration-200`
            )}
            onClick={toggleEvent}
            disabled={disabled}
            type='button'
            tabIndex={0}
            aria-checked={checked}
            title={label}
        >
            <span className="sr-only">{label}</span>
            <ImgLeft className={classNames(
                `transform transition-transform`,
                {
                    'scale-100 duration-300': !checked,
                    'scale-0 duration-500': checked
                }
            )}/>
            <ImgRight className={classNames(
                `ml-3.5 transform transition-transform`,
                {
                    'scale-100 duration-300': checked,
                    'scale-0 duration-500': !checked
                }
            )}/>
            <span className={classNames(
                `absolute h-8 flex items-center justify-center transition duration-500 transform`
            )}>
                <ImgLeft className={classNames(
                    `transition duration-500 transform`,
                    imageLeftColor,
                    checked ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
                )}/>
                <ImgRight className={classNames(
                    `ml-3.5 transition duration-500 transform`,
                    imageRightColor,
                    checked ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
                )}/>
            </span>
        </button>
    );
}

export default Switcher;