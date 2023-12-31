import { Main } from "@k8slens/extensions";

export default class JxExtensionMain extends Main.LensExtension {
  onActivate() {
    console.log('helloworld-sample activated');
  }

  onDeactivate() {
    console.log('helloworld-sample de-activated');
  }
}
