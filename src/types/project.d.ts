export interface MediaItem {
    type: 'video' | 'image' | 'pdf';
    url: string;
    title: string;
    description: string;
}

export interface ProjectProps {
    code: string;
    title: string;
    description: string;
    date: number | string;
    year: number;
    month: number;
    type: string;
    tags: string[];
    tech: string[];
    link?: string;
    route: string | null;
    poster: string;
    thumbnail: string;
    banner: string;
    details: string[];
    media?: MediaItem[];
    body?: string;
}