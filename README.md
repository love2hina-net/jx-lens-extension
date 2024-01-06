# Lens Extension for working with Jenkins X

This extension improves the UX around working with pipelines and preview environments.

## License
This project was released under the Apache-2.0 License.

## 確認状況
* OpenLens 6.5.2
* Jenkins X 3.10.126

## 開発
### ビルド
```pwsh
& npm run dev
```

### インストール
```pwsh
Set-Location -Path ~/.k8slens/extensions
New-Item -Name 'jx-lens-extension' -Value '(git clone directory)' -ItemType SymbolicLink
```

## リリース
### ビルド
```pwsh
& npm run build
& npm pack
```
