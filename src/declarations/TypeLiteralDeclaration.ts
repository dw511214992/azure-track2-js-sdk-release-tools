import { ExportableDeclaration } from './Declaration';
import {PropertyDeclaration} from "./PropertyDeclaration";
import {MethodDeclaration} from "./MethodDeclaration";
import {IntersectionDeclaration} from "./IntersectionDeclaration";

/**
 * Alias declaration that can be exported. Is used to defined types.
 * (e.g. type Foobar = { name: string };)
 *
 * @export
 * @class TypeAliasDeclaration
 * @implements {ExportableDeclaration}
 */
export class TypeLiteralDeclaration {
    public name: string;
    public properties: PropertyDeclaration[] = [];
    public methods: MethodDeclaration[] = [];
    public intersectionDeclarations: IntersectionDeclaration[] = [];
    public typeLiteralDeclarations: TypeLiteralDeclaration[] = [];
    public start?: number;
    public end?: number;

    constructor(name: string, start: number, end: number) {
        this.name = name;
        this.start = start;
        this.end = end;
    }
}
