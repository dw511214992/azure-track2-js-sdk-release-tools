export function traverseAst(root: any, visit: (node: any) => void, skipContents?: (node: any) => boolean): void {
    const stack = (root as any).getChildren();

    for (let node = stack.shift(); node !== undefined; node = stack.shift()) {
        visit(node);

        if (skipContents && skipContents(node)) {
            continue;
        }

        stack.unshift(...node.getChildren());
    }
}
