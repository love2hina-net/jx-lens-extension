# Lens extension for Jenkins X

以下の機能を追加する、簡単なLens用Extensionです。

* クラスターメニューに"Jenkins X"項目を追加します。
* PipelieneActivityの表示項目を拡張します。

## License
This project was released under the MIT License.

## 確認状況
* OpenLens 6.5.2
* Jenkins X 3.10.126

## 開発
### インストール
```pwsh
Set-Location -Path ~/.k8slens/extensions
New-Item -Name 'jx-lens-extension' -Value '(git clone directory)' -ItemType SymbolicLink
```

### ビルド
```pwsh
& npm run dev
```
