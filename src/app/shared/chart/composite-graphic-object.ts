import { SimpleGraphicObject } from "./simple-graphic-object";

export class CompositeGraphicObject {
    constructor(
        public name: string,
        public series: Array<SimpleGraphicObject>,
    ){}
}