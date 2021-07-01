import {isIntersectionTypeNode, isTypeLiteralNode, isTypeReferenceNode, TypeAliasDeclaration} from 'typescript';

import {TypeAliasDeclaration as TshType} from '../declarations/TypeAliasDeclaration';
import {Resource} from '../resources/Resource';
import {getNodeType, isNodeExported} from './parse-utilities';
import {parseIntersectionPart} from "./intersection-parser";
import {parseTypeLiteral} from "./type-literal-parser";

/**
 * Parses a type alias into the declaration.
 *
 * @export
 * @param {Resource} resource
 * @param {TypeAliasDeclaration} node
 */
export function parseTypeAlias(resource: Resource, node: TypeAliasDeclaration): void {
    const typeAliasDeclaration = new TshType(node.name.text, isNodeExported(node), node.getStart(), node.getEnd());
    if (node.type) {
        if (isIntersectionTypeNode(node.type)) {
            typeAliasDeclaration.type = parseIntersectionPart(node.type, '');
        } else if (isTypeLiteralNode(node.type)) {
            typeAliasDeclaration.type = parseTypeLiteral(node.type, '');
        } else if (isTypeReferenceNode(node.type)) {
            typeAliasDeclaration.type = getNodeType(node.type);
        }
    }
    resource.declarations.push(
        typeAliasDeclaration
    );
}
