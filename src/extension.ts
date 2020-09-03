'use strict'
import * as vscode from 'vscode'
import * as fs from 'fs'
import * as path from 'path'

type QuickPick = vscode.QuickPick<vscode.QuickPickItem>

const home: string = path.normalize(
    process.env[process.platform == 'win32' ? 'USERPROFILE' : 'HOME'] || '/'
)

function readdir(dir: fs.PathLike, showHidden: boolean): Promise<string[]> {
    return new Promise((resolve, reject) => {
        fs.readdir(dir, (err, files) => {
            if (err) {
                reject(err)
            } else {
                const filtered = showHidden ? files : files.filter((f) => !/^\..*/.test(f))
                resolve(filtered)
            }
        })
    })
}

function isDirectory(path: fs.PathLike): Promise<boolean> {
    return new Promise((resolve, reject) => {
        fs.lstat(path, (err, stats) => {
            if (err) {
                return reject(err)
            }
            resolve(stats.isDirectory())
        })
    })
}

function handleDidChangeValue(qp: vscode.QuickPick<vscode.QuickPickItem>) {
    return function (value: string) {
        if (value.length > 1 && value.slice(-1) === '/') {
            const newPath = path.normalize(qp.placeholder + '/' + value)
            isDirectory(newPath).then((isDir) => {
                if (isDir) {
                    updateQuickPick(qp, newPath)
                }
            })
        }
    }
}

function handleDidAccept(qp: vscode.QuickPick<vscode.QuickPickItem>) {
    return function () {
        const selectedLabel = qp.activeItems[0].label
        const selectedPath = selectedLabel.split(' ')[1] ?? selectedLabel;
        const newPath = path.normalize(qp.placeholder + '/' + selectedPath)
        isDirectory(newPath)
            .then((isDir) => {
                if (isDir) {
                    if (selectedPath === '.') {
                        const action = vscode.workspace.getConfiguration("vscode-tiller").get('openCurrentDirectoryAction');
                        if (action === "open in same window") {
                            vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(qp.placeholder || "/"), false);
                        }
                        else if (action === "open in new window") {
                            vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(qp.placeholder || "/"), true);
                        }
                        else if (action === "open new folder in same window") {
                            const { workspaceFolders } = vscode.workspace
                            vscode.workspace.updateWorkspaceFolders(
                                workspaceFolders ? workspaceFolders.length : 0,
                                null,
                                {
                                    uri: vscode.Uri.file(newPath),
                                    name: path.basename(newPath)
                                }
                            )
                        }
                    } else {
                        updateQuickPick(qp, newPath)
                    }
                } else {
                    const openPath = vscode.Uri.file(newPath)
                    qp.hide()
                    vscode.workspace.openTextDocument(openPath).then((doc) => {
                        return vscode.window.showTextDocument(doc)
                    })
                }
            })
            .catch((err) => {
                vscode.window.showErrorMessage(err)
            })
    }
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    let qp = vscode.window.createQuickPick()
    let qpVisible = false
    let showHidden = false

    qp.onDidChangeValue(handleDidChangeValue(qp))
    qp.onDidAccept(handleDidAccept(qp))
    qp.onDidHide(() => {
        qpVisible = false
    })

    let disposable = vscode.commands.registerCommand('tiller.show', () => {
        const { window, workspace } = vscode
        const { workspaceFolders } = workspace
        let editor = window.activeTextEditor
        let dir = home
        let initialSelection = []

        if (editor && editor.document.uri.scheme === 'file') {
            const { fsPath } = editor.document.uri
            dir = path.dirname(fsPath)
            initialSelection.push({ label: editor.document.fileName })
        }
        else if (workspaceFolders && workspaceFolders.length > 0) {
            dir = workspaceFolders[0].uri.fsPath
        }

        qp.selectedItems = initialSelection

        updateQuickPick(qp, dir).then(() => {
            qpVisible = true
        })
    })

    let back = vscode.commands.registerCommand('tiller.back', () => {
        try {
            if (qpVisible) {
                const parent = path.normalize(qp.placeholder + '/..')
                updateQuickPick(qp, parent)
            }
        } catch (e) {
            vscode.window.showErrorMessage(e.message)
        }
    })

    let forward = vscode.commands.registerCommand('tiller.forward', () => {
        try {
            if (qpVisible) {
                const selectedLabel = qp.activeItems[0].label
                const selectedPath = selectedLabel.split(' ')[1] ?? selectedLabel;
                const newPath = path.normalize(qp.placeholder + '/' + selectedPath)

                isDirectory(newPath)
                    .then((isDir) => {
                        if (isDir) {
                            updateQuickPick(qp, newPath, showHidden)
                        } else {
                            const openPath = vscode.Uri.file(newPath)
                            qp.hide()
                            vscode.workspace.openTextDocument(openPath).then((doc) => {
                                return vscode.window.showTextDocument(doc)
                            })
                        }
                    })
                    .catch((err) => {
                        vscode.window.showErrorMessage(err)
                    })
            }
        } catch (e) {
            vscode.window.showErrorMessage(e.message)
        }
    })

    let toggleHidden = vscode.commands.registerCommand('tiller.toggleHidden', () => {
        try {
            if (qpVisible) {
                showHidden = !showHidden
                updateQuickPick(qp, qp.placeholder || home, showHidden)
            }
        } catch (e) {
            vscode.window.showErrorMessage(e.message)
        }
    })

    context.subscriptions.push(disposable)
    context.subscriptions.push(back)
    context.subscriptions.push(forward)
    context.subscriptions.push(toggleHidden)
}

function updateQuickPick(qp: QuickPick, dir: string, showHidden = false) {
    qp.busy = true
    return readdir(dir, showHidden)
        .then((files) => {
            return Promise.all(
                files.map((file) =>
                    isDirectory(`${dir}/${file}`).then((isDir) => {
                        const path = isDir ? `${file}/` : file;
                        const label = isDir ? `$(folder) ${path}` : `$(file) ${path}`;
                        return {
                            label,
                            description: '',
                            isDir
                        }
                    })
                )
            )
                .then((items) => {
                    type Item = { label: string }
                    const sortFn = (a: Item, b: Item) => a.label.localeCompare(b.label)

                    const directories = items.filter((item) => item.isDir).sort(sortFn)
                    const files = items.filter((item) => !item.isDir).sort(sortFn)

                    const showCurrent = vscode.workspace.getConfiguration("vscode-tiller").get('showCurrentDirectory')

                    const newItems = [{ label: '..', description: '(parent directory)', isDir: true }]

                    if (showCurrent) {
                        newItems.push({ label: '.', description: '(current directory)', isDir: true })
                    }

                    newItems.push(...directories)
                    newItems.push(...files)

                    return newItems
                })
                .then((items) => {
                    qp.placeholder = path.normalize(dir)
                    qp.value = ''
                    qp.items = items
                    qp.show()
                    qp.busy = false
                })
        })
        .catch((err) => {
            vscode.window.showErrorMessage(err.message)
        })
}

// this method is called when your extension is deactivated
export function deactivate() { }
