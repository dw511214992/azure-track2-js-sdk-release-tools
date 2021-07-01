import {IntersectionTypeNode, isTypeLiteralNode, isTypeReferenceNode, NodeArray, TypeNode} from "typescript";
import {getNodeType} from "./parse-utilities";
import {IntersectionDeclaration} from "../declarations/IntersectionDeclaration";
import {parseTypeLiteral} from "./type-literal-parser";

export function parseIntersectionPart(node: IntersectionTypeNode, name: string): IntersectionDeclaration {
    const types: NodeArray<TypeNode> = node.types;
    const intersectionDeclaration = new IntersectionDeclaration(name, node.getStart(), node.getEnd());
    if (types) {
        types.forEach((t) => {
            if (isTypeReferenceNode(t)) {
                intersectionDeclaration.inherits.push(getNodeType(t));
            } else if (isTypeLiteralNode(t)) {
                intersectionDeclaration.typeLiteralDeclarations.push(parseTypeLiteral(t, ''));
            }
        });
    }
    return intersectionDeclaration;
}
