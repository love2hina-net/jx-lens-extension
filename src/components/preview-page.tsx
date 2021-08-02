import styles from "../../styles.module.scss";

import {Renderer} from "@k8slens/extensions";
import React from "react";
import {previewsStore} from "../preview-store";
import {Preview} from "../preview"
import {ExternalLink} from "./external-link";

enum sortBy {
  owner = "owner",
  repository = "repository",
  pr = "pr",
  age = "age"
}


export class PreviewPage extends React.Component<{ extension: Renderer.LensExtension }> {

  render() {
    return (
      <Renderer.Component.TabLayout>
        <Renderer.Component.KubeObjectListLayout
          tableId="previews"
          className={styles.PreviewList} store={previewsStore}
          sortingCallbacks={{
            [sortBy.owner]: (preview: Preview) => preview.spec.pullRequest.owner,
            [sortBy.repository]: (preview: Preview) => preview.spec.pullRequest.repository,
            [sortBy.pr]: (preview: Preview) => preview.spec.pullRequest.number,
            [sortBy.age]: (preview: Preview) => preview.createdTime,
          }}
          searchFilters={[
            (preview: Preview) => preview.getSearchFields()
          ]}
          renderHeaderTitle="Activities"
          renderTableHeader={[
            {title: "Owner", className: "owner", sortBy: sortBy.owner},
            {title: "Repository", className: "repository", sortBy: sortBy.repository},
            {title: "PR", className: "pr", sortBy: sortBy.pr},
            {title: "Preview", className: "preview"},
            {title: "Age", className: "age", sortBy: sortBy.age},
          ]}
          renderTableContents={(preview: Preview) => {
            return [
              preview.spec.pullRequest.owner,
              preview.spec.pullRequest.repository,
              preview.spec.pullRequest.number,
              renderPreview(preview),
              preview.createdAt
            ];
          }}
        />
      </Renderer.Component.TabLayout>
    )
  }
}

// renderPreview renders the try it button
function renderPreview(preview: Preview) {
  if (!preview || !preview.spec) {
    return "";
  }
  const appURL = preview.spec.resources.url;
  if (!appURL) {
    return ""
  }
  return (
    <ExternalLink href={appURL} text="try me" title="try out the preview"></ExternalLink>
  );
}

