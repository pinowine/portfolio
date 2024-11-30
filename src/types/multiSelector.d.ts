interface MultiSelectorData {
    parameter: string;
    name: string;
    img?: string;
    children?: MultiSelectorData[];
}

export interface MultiSelectorProps {
    disabled: boolean;
    title: string;
    data: MultiSelectorData[];
    onChange: (selected: string[]) => void;
    selected: string[];
}