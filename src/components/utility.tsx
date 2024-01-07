import * as ts from 'typescript';
import React from 'react';
import { $$escape, $$raw, EmptyDecorator } from 'ts-macros';

export function $if(condition: any, child: () => React.JSX.Element): any {
  return (condition) && $$escape!(child);
}

// TODO: decorator macroを検討する
function $test(condition: any): EmptyDecorator {
  return $$raw!((ctx, node: ts.StringLiteral) => {
    const target = ctx.thisMacro.target as ts.ClassDeclaration;
    return target;
  });
}
