import React from 'react';

export function If({ condition, children }: { condition: boolean; children?: React.JSX.Element }): React.JSX.Element | null {
  return (condition)? (<>{ children }</>) : null;
}
