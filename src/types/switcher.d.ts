export interface SwitcherProps {
    toggleEvent: () => void;
    checked: boolean; 
    imgLeft: svg;
    imgRight: svg;
    label: string;
    disabled: boolean;
    imgLeftColor: string;
    imgRightColor: string
}