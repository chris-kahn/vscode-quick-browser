# quick-browser README

This is a small extension for Visual Studio Code that replicates the file browsing capability of Helm in Emacs. When opened, it shows the contents of the current file's directory, and from there you can navigate around the filesystem to open other files.

I made this extension because I like Helm's way of browsing files in Emacs and wanted to have something similar in vsode. There may be bugs or things missing, but feel free to create issues or PRs.

TODO: allow creation of new files and directories

## Extension Settings

The following commands are provided for keybinding:

* `quick-browser.show`: open the palette with Quick Browser (alt/ctrl+p)
* `quick-browser.back`: go up to the parent directory (alt/ctrl+left)
* `quick-browser.forward`: open a file or go into a directory (alt/ctrl+right)
* `quick-browser.toggleHidden`: show or hide dotfiles (alt/ctrl+.)

For the defaults, use alt on windows, or ctrl on macos.

## Release Notes

### 1.0.0

Initial release of quick-browser
