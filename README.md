# Tiller

Tiller is a keyboard-based file browser for Visual Studio Code, which should be familiar for those who've used [Helm](https://github.com/emacs-helm/helm) in Emacs. It allows you to navigate around your filesystem using the keyboard, filtering the available files as you type.

![screenshot](images/preview.gif)

## Extension Settings

### Keybindings

* `tiller.show`: open the palette with Tiller (alt/ctrl+p)
* `tiller.back`: go up to the parent directory (left)
* `tiller.forward`: open a file or go into a directory (right)
* `tiller.toggleHidden`: show or hide dotfiles (alt/ctrl+.)

For the defaults, use alt on windows, or ctrl on macos.

### Settings

* `vscode-tiller.showCurrentDirectory`: Whether to show '. (current)' for the current directory. `true|false`
* `vscode-tiller.openCurrentDirectoryAction`: What to do when selecting the current directory. Available options: `"none" | "open in same window" | "open in new window" | "open new folder in same window"`