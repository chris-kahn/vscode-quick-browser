import * as vscode from 'vscode'
import * as fs from 'fs'
import * as path from 'path'
import { Tiller } from './types'
import { updateQuickPick } from './updateQuickPick'

export function readdir(dir: fs.PathLike, showHidden: boolean): Promise<string[]> {
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

export function isDirectory(path: fs.PathLike): Promise<boolean> {
    return new Promise((resolve, reject) => {
        fs.lstat(path, (err, stats) => {
            if (err) {
                return reject(err)
            }
            resolve(stats.isDirectory())
        })
    })
}

export async function openTextDocument(path: string) {
    const openPath = vscode.Uri.file(path)
    const doc = await vscode.workspace.openTextDocument(openPath)
    const editor = await vscode.window.showTextDocument(doc)
    return editor
}

/**
 * Given a 'Tiller' context, open its selected item.
 * 
 * @param tiller a Tiller context
 */
export async function openSelected(tiller: Tiller) {
    const selectedPath = tiller.quickPick.activeItems[0]?.path
    if (!selectedPath) return

    const fullPath = path.normalize(tiller.quickPick.placeholder + '/' + selectedPath)
    if (await isDirectory(fullPath)) {
        if (selectedPath === '.') {
            const action = vscode.workspace.getConfiguration("vscode-tiller").get('openCurrentDirectoryAction');
            if (action === "open in same window") {
                await vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(tiller.quickPick.placeholder || "/"), false);
            }
            else if (action === "open in new window") {
                await vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(tiller.quickPick.placeholder || "/"), true);
            }
            else if (action === "open new folder in same window") {
                const { workspaceFolders } = vscode.workspace
                vscode.workspace.updateWorkspaceFolders(
                    workspaceFolders ? workspaceFolders.length : 0,
                    null,
                    {
                        uri: vscode.Uri.file(fullPath),
                        name: path.basename(fullPath)
                    }
                )
            }
        } else {
            await updateQuickPick(tiller, fullPath)
        }
    } else {
        tiller.quickPick.hide()
        await openTextDocument(fullPath)
    }
}