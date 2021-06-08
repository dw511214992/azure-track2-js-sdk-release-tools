import { ExportableDeclaration } from './Declaration';
import {PropertyDeclaration} from "./PropertyDeclaration";
import {MethodDeclaration} from "./MethodDeclaration";
import {InterfaceDeclaration} from "typescript";
import {IntersectionDeclaration} from "./IntersectionDeclaration";

/**
 * Alias declaration that can be exported. Is used to defined types.
 * (e.g. type Foobar = { name: string };)
 *
 * @export
 * @class TypeAliasDeclaration
 * @implements {ExportableDeclaration}
 */
export class TypeAliasDeclaration implements ExportableDeclaration {
    public name: string;
    public isExported: boolean;
    public type: any = undefined;
    public methods: MethodDeclaration[] = [];
    public start?: number;
    public end?: number;

    constructor(name: string, isExported: boolean, start: number, end: number) {
        this.name = name;
        this.isExported = isExported;
        this.start = start;
        this.end = end;
    }
}
