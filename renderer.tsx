import {Renderer} from "@k8slens/extensions";
import React from "react";
import {ActivityDetails, ActivityDetailsProps} from "./src/components/activity-details";
import {ActivityPage} from "./src/components/activity-page";
import {Activity} from "./src/activity"
import {ActivityMenu, ActivityMenuProps} from "./src/components/activity-menu";
import {PreviewPage} from "./src/components/preview-page";

export function CertificateIcon(props: Renderer.Component.IconProps) {
  //return <Renderer.Component.Icon {...props} material="security" tooltip="Certificates"/>
  return <Renderer.Component.Icon {...props} material="extension" tooltip="Jenkins X"/>
  //return <Renderer.Component.Icon {...props} href="https://raw.githubusercontent.com/jenkins-x/jenkins-x-website/master/images/logo/jenkinsx-ico-white.svg" tooltip="Jenkins X"/>
}

export default class JenkinsXExtension extends Renderer.LensExtension {
  clusterPages = [
    {
      id: "pipelines",
      components: {
        Page: () => <ActivityPage extension={this}/>,
        MenuIcon: CertificateIcon,
      }
    }, {
      id: "previews",
      components: {
        Page: () => <PreviewPage extension={this}/>,
        MenuIcon: CertificateIcon,
      }
    }
  ]

  clusterPageMenus = [
    {
      target: {pageId: "pipelines"},
      title: "Jenkins X: Pipelines",
      components: {
        Icon: CertificateIcon,
      }
    },
    {
      target: {pageId: "previews"},
      title: "Jenkins X: Previews",
      components: {
        Icon: CertificateIcon,
      }
    },
  ];

  kubeObjectMenuItems = [
    {
      kind: Activity.kind,
      apiVersions: ["jenkins.io/v1"],
      components: {
        MenuItem: (props: ActivityMenuProps) => <ActivityMenu {...props} />
      }
    },
  ];


  kubeObjectDetailItems = [{
    kind: Activity.kind,
    apiVersions: ["jenkins.io/v1"],
    components: {
      Details: (props: ActivityDetailsProps) => <ActivityDetails {...props} />
    }
  }]
}
