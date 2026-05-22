import { parseSvg } from "@meta2d/svg";
import type { Pen } from "@meta2d/core"

export { emitter } from './emitter'

export interface CustomPen {
    name: string;
    image: string;
    data?: Pen;
    component?: boolean;
    svg?: string;
    crossOrigin?: string;
}

export async function svgToPens(image: string): Promise<CustomPen> {
    const name = getFileName(image);
    const resData = await fetch(image).then(res => res.text());
    const data = resData
    return {
        name,
        image,
        svg: resData,
        data: parseSvg(data),
        component: true
    }
}

export function pngToPens(image: string): CustomPen {
    const name = getFileName(image);
    const ext = image.split('.').pop()
    return {
        name,
        image,
        data: {
            name: ext,
            // text: name,
            x: 100,
            y: 100,
            width: 100,
            height: 100,
            image,
            imageRatio: true,
            crossOrigin: 'undefined'//默认是'anonymous'
        }
    }
}


function getFileName(path: string) {
    const start = path.lastIndexOf("/");
    const end = path.lastIndexOf(".");
    return path.substring(start + 1, end);
}