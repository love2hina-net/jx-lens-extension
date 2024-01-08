import styles from '../../styles.module.scss';

import { Renderer } from '@k8slens/extensions';
import React from 'react';
import { previewsStore } from '../objects/preview-store';
import { Preview } from '../objects/preview';
import { ExternalLink } from './external-link';

enum sortBy {
  owner = 'owner',
  repository = 'repository',
  pr = 'pr',
  comment = 'comment',
  author = 'author',
  age = 'age',
}

export class PreviewPage extends React.Component {
  render() {
    return (
      <Renderer.Component.TabLayout>
        <Renderer.Component.KubeObjectListLayout
          tableId='previews'
          className={styles.PreviewList}
          store={previewsStore}
          sortingCallbacks={{
            [sortBy.owner]: (preview: Preview) => preview.spec.pullRequest?.owner,
            [sortBy.repository]: (preview: Preview) => preview.spec.pullRequest?.repository,
            [sortBy.pr]: (preview: Preview) => preview.spec.pullRequest?.number,
            [sortBy.comment]: (preview: Preview) => preview.spec.pullRequest?.title,
            [sortBy.author]: (preview: Preview) => (preview.spec.pullRequest?.user?.username ?? '') + '/' + preview.spec.pullRequest?.owner + '/' + preview.spec.pullRequest?.repository,
            [sortBy.age]: (preview: Preview) => preview.createdTime,
          }}
          searchFilters={[
            (preview: Preview) => preview.getSearchFields(),
          ]}
          renderHeaderTitle='Previews'
          renderTableHeader={[
            { title: 'Owner', className: 'owner', sortBy: sortBy.owner },
            { title: 'Repository', className: 'repository', sortBy: sortBy.repository },
            { title: 'PR', className: 'pr', sortBy: sortBy.pr },
            { title: 'Comment', className: 'comment', sortBy: sortBy.comment },
            { title: 'Author', className: 'author' },
            { title: 'Preview', className: 'preview' },
            { title: 'Age', className: 'age', sortBy: sortBy.age },
          ]}
          renderTableContents={(preview: Preview) => {
            return [
              preview.spec.pullRequest?.owner,
              preview.spec.pullRequest?.repository,
              preview.spec.pullRequest?.number,
              this.renderComment(preview),
              this.renderAuthor(preview),
              this.renderPreview(preview),
              preview.createdAt,
            ];
          }}
        />
      </Renderer.Component.TabLayout>
    );
  }

  // renderComment renders the try it button
  private renderComment(preview: Preview) {
    const comment = preview.spec.pullRequest?.title;
    return (
      <span title={comment}>{comment}</span>
    );
  }

  // renderAuthor renders the author
  private renderAuthor(preview: Preview) {
    const user = preview.spec.pullRequest?.user;
    const name = user?.name;
    const imageUrl = user?.imageUrl;
    const linkUrl = user?.linkUrl ?? 'https://github.com/' + name;
    if (!name || !imageUrl) {
      return <span>{ name }</span>;
    }
    return (
      <span
        title={name}
        className={styles['author-details']}
      >
        <figure key='image'>
          <img
            height='18'
            width='18'
            src={imageUrl}
            onLoad={(evt) => evt.currentTarget.classList.add('visible')}
          />
        </figure>
        &nbsp;
        <ExternalLink href={linkUrl} text={name} title='view the user in git' />
      </span>
    );
  }

  // renderPreview renders the try it button
  private renderPreview(preview: Preview) {
    const appURL = preview.spec.resources?.url;
    if (!appURL) {
      return '';
    }
    return (
      <ExternalLink href={appURL} text='try me' title='try out the preview'></ExternalLink>
    );
  }
}
