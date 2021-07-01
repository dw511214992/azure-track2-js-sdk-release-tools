import { ExportableDeclaration } from './Declaration';
import {PropertyDeclaration} from "./PropertyDeclaration";
import {MethodDeclaration} from "./MethodDeclaration";
import {TypeLiteralDeclaration} from "./TypeLiteralDeclaration";

/**
 * Alias declaration that can be exported. Is used to defined types.
 * (e.g. type Foobar = { name: string };)
 *
 * @export
 * @class TypeAliasDeclaration
 * @implements {ExportableDeclaration}
 */
export class IntersectionDeclaration {
    public name: string;
    public inherits: any[] = [];
    public typeLiteralDeclarations: TypeLiteralDeclaration[] = [];
    public start?: number;
    public end?: number;

    constructor(name: string, start: number, end: number) {
        this.name = name;
        this.start = start;
        this.end = end;
    }
}
