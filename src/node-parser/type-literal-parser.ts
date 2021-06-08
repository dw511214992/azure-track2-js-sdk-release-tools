import {isMethodSignature, isPropertySignature} from "../type-guards/TypescriptGuards";
import {DeclarationVisibility, MethodDeclaration, PropertyDeclaration} from "../declarations";
import {Identifier, isIntersectionTypeNode, isTypeLiteralNode, PropertySignature, SyntaxKind, TypeLiteralNode} from "typescript";
import {containsModifier, getNodeType} from "./parse-utilities";
import {parseMethodParams} from "./function-parser";
import {TypeLiteralDeclaration} from "../declarations/TypeLiteralDeclaration";
import {parseIntersectionPart} from "./intersection-parser";

export function parseTypeLiteral(node: TypeLiteralNode, name: string): TypeLiteralDeclaration {
    const typeLiteralDeclaration = new TypeLiteralDeclaration(name, node.getStart(), node.getEnd());
    if (node.members) {
        node.members.forEach((o) => {
            if (isPropertySignature(o)) {
                const ps: PropertySignature = o as PropertySignature;
                let findType = false;
                if (ps.type) {
                    if (isIntersectionTypeNode(ps.type)) {
                        const intersectionDeclaration = parseIntersectionPart(ps.type, (o.name as Identifier).text);
                        typeLiteralDeclaration.intersectionDeclarations.push(intersectionDeclaration);
                        findType = true;
                    } else if (isTypeLiteralNode(ps.type)) {
                        const typeLiteralDeclaration = parseTypeLiteral(ps.type, (o.name as Identifier).text);
                        typeLiteralDeclaration.typeLiteralDeclarations.push(typeLiteralDeclaration);
                        findType = true;
                    }
                }
                if (!findType) {
                    typeLiteralDeclaration.properties.push(
                        new PropertyDeclaration(
                            (o.name as Identifier).text,
                            DeclarationVisibility.Public,
                            getNodeType(o.type),
                            !!o.questionToken,
                            containsModifier(o, SyntaxKind.StaticKeyword),
                            o.getStart(),
                            o.getEnd(),
                        ),
                    );
                }
            } else if (isMethodSignature(o)) {
                const method = new MethodDeclaration(
                    (o.name as Identifier).text,
                    true,
                    DeclarationVisibility.Public,
                    getNodeType(o.type),
                    !!o.questionToken,
                    containsModifier(o, SyntaxKind.StaticKeyword),
                    containsModifier(o, SyntaxKind.AsyncKeyword),
                    o.getStart(),
                    o.getEnd(),
                );
                method.parameters = parseMethodParams(o);
                typeLiteralDeclaration.methods.push(method);
            }
        })
    }
    return typeLiteralDeclaration;
}
