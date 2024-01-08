import styles from '../../styles.module.scss';

import { Renderer } from '@k8slens/extensions';
import React from 'react';

import { lighthouseBreakpointsStore } from '../objects/lighthouse-breakpoint-store';
import { LighthouseBreakpoint } from '../objects/lighthouse-breakpoint';

const {
  Component: { KubeObjectListLayout, TabLayout },
} = Renderer;

enum sortBy {
  repository = 'repository',
  branch = 'branch',
  context = 'context',
  breakpoint = 'breakpoint',
  age = 'age',
}

export class LighthouseBreakpointPage extends React.Component {
  render() {
    return (
      <TabLayout>
        <KubeObjectListLayout
          tableId='lighthouseBreakpoints'
          className={styles.BreakpointList}
          store={lighthouseBreakpointsStore}
          sortingCallbacks={{
            [sortBy.repository]: (breakpoint: LighthouseBreakpoint) =>
              LighthouseBreakpointPage.renderRepository(breakpoint),
            [sortBy.branch]: (breakpoint: LighthouseBreakpoint) => breakpoint.spec.filter?.branch,
            [sortBy.context]: (breakpoint: LighthouseBreakpoint) => breakpoint.spec.filter?.context,
            [sortBy.breakpoint]: (breakpoint: LighthouseBreakpoint) =>
              LighthouseBreakpointPage.renderBreakpoint(breakpoint),
            [sortBy.age]: (breakpoint: LighthouseBreakpoint) => breakpoint.createdTime,
          }}
          searchFilters={[(breakpoint: LighthouseBreakpoint) => breakpoint.getSearchFields()]}
          renderHeaderTitle='Breakpoints'
          renderTableHeader={[
            { title: 'Repository', className: 'repository', sortBy: sortBy.repository },
            { title: 'Branch', className: 'branch', sortBy: sortBy.branch },
            { title: 'Context', className: 'context', sortBy: sortBy.context },
            { title: 'Breakpoint', className: 'breakpoint', sortBy: sortBy.breakpoint },
            { title: 'Age', className: 'age', sortBy: sortBy.age },
          ]}
          renderTableContents={(breakpoint: LighthouseBreakpoint) => {
            return [
              LighthouseBreakpointPage.renderRepository(breakpoint),
              breakpoint.spec.filter?.branch,
              breakpoint.spec.filter?.context,
              LighthouseBreakpointPage.renderBreakpoint(breakpoint),
              breakpoint.createdAt,
            ];
          }}
        />
      </TabLayout>
    );
  }

  // renderBreakpoint renders the try it button
  private static renderBreakpoint(breakpoint: LighthouseBreakpoint): string {
    const breakpoints = breakpoint.spec.debug?.breakpoint;
    return breakpoints?.join(', ') ?? '';
  }

  // renderRepository renders the repository name
  private static renderRepository(breakpoint: LighthouseBreakpoint): string {
    const owner = breakpoint.spec.filter?.owner;
    const repository = breakpoint.spec.filter?.repository;
    if (owner) {
      return repository ? owner + '/' + repository : owner;
    }
    return repository ?? '';
  }
}
