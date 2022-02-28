import { Link } from "./Link";

export interface InfoItem {
    title: string;
    contents?: Content[];
}

export interface Content {
    text: string;
    links?: Link[];
}
