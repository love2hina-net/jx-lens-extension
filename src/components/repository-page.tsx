import styles from '../../styles.module.scss';

import { Renderer } from '@k8slens/extensions';
import React from 'react';
import { sourceRepositoriesStore } from '../objects/source-repository-store';
import { SourceRepository } from '../objects/source-repository'
import escape from 'lodash/escape';

enum sortBy {
  owner = 'owner',
  repository = 'repository',
  age = 'age'
}


export class RepositoryPage extends React.Component {

  render() {
    return (
      <Renderer.Component.TabLayout>
        <Renderer.Component.KubeObjectListLayout
          tableId='repositories'
          className={styles.RepositoryList} store={sourceRepositoriesStore}
          sortingCallbacks={{
            [sortBy.owner]: (repository: SourceRepository) => repository.spec.org + '/' + repository.spec.repo,
            [sortBy.repository]: (repository: SourceRepository) => repository.spec.repo,
            [sortBy.age]: (repository: SourceRepository) => repository.createdTime,
          }}
          searchFilters={[
            (repository: SourceRepository) => repository.getSearchFields()
          ]}
          renderHeaderTitle='Repositories'
          renderTableHeader={[
            {title: 'Owner', className: 'owner', sortBy: sortBy.owner},
            {title: 'Repository', className: 'repository', sortBy: sortBy.repository},
            {title: 'Status', className: 'status'},
            {title: 'Age', className: 'age', sortBy: sortBy.age},
          ]}
          renderTableContents={(repository: SourceRepository) => {
            return [
              repository.spec.org,
              repository.spec.repo,
              renderStatus(repository),
              repository.createdAt
            ];
          }}
        />
      </Renderer.Component.TabLayout>
    )
  }
}

// renderStatus renders the status
function renderStatus(repository: SourceRepository) {
  if (!repository || !repository.metadata || !repository.metadata.annotations) {
    return '';
  }
  const annotations = repository.metadata.annotations;
  let value = annotations['webhook.jenkins-x.io'] || '';
  if (!value) {
    return '';
  }
  value = value.toLowerCase();
  if (value === 'true') {
    return (
      <span className={styles['status-succeeded']} title='Webhook registered in git successfully'>Succeeded</span>
    );
  }
  if (value.startsWith('creat')) {
    return (
      <span className={styles['status-running']} title='Creating webhook on the git successfully'>Creating</span>
    );
  }
  let title = 'Failed to register webhook';
  const message = annotations['webhook.jenkins-x.io/error'];
  if (message) {
    title += '\n' + escape(message);
  }
  return (
    <span className={styles['status-failed']} title={title}>Failed</span>
  );
}

