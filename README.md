# Lens Extension for working with Jenkins X

This extension improves the UX around working with pipelines and preview environments.

## Install

```sh
mkdir -p ~/.k8slens/extensions
git clone https://github.com/jenkins-x-plugins/jx-lens.git
ln -s $(pwd)/jx-lens ~/.k8slens/extensions/jx-lens
```

## Build

To build the extension you can use `make` or run the `npm` commands manually:

```sh
cd jx-lens
make build
```

OR

```sh
cd jx-lens
npm install
npm run build
```

If you want to watch for any source code changes and automatically rebuild the extension you can use:

```sh
cd jx-lens
npm run dev
```

## Test

Open Lens application and navigate to a cluster. You should see "Certificates" in a menu.

## Uninstall

```sh
rm ~/.k8slens/extensions/jx-lens
```

Restart Lens application.
