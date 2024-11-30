interface SelectorData {
    name:string, 
    parameter:string, 
    img?:string, 
    children?: SelectorData[]
}

export interface SelectorProps {
    disabled: boolean;
    label: string;
    data: SelectorData[];
    buttonEvent: (parameter:string) => void;
    defaultName: string;
    showPara: boolean;
}