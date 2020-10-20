/*! 
 * Copyright (C) 2018-2020 Christopher Kahn - All Rights Reserved
 * 
 * This file is part of Tiller.
 *
 * Tiller is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Tiller is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Tiller.  If not, see <https://www.gnu.org/licenses/>.
 */
import * as vscode from 'vscode'
import * as fs from 'fs'
import * as path from 'path'
import { Tiller } from './types'

/**
 * Wraps 'fs.readdir' in a 'Promise'.
 * 
 * @param dir 
 * @param showHidden 
 */
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

/**
 * Helper to check if a given path is a directory using 'fs.lstat'.
 * 
 * @param path 
 */
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

/**
 * Open the given path in vscode as a file.
 * 
 * @param path 
 */
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

/**
 * Updates 'Tiller' to display the contents of the given directory.
 * 
 * @param tiller A 'Tiller' context
 * @param dir the directory to dive into
 */
export async function updateQuickPick(tiller: Tiller, dir: string) {
    const { quickPick, showHidden } = tiller
    try {
        quickPick.busy = true
        const dirContents = await readdir(dir, showHidden)
        const items = await Promise.all(dirContents.map(async (file) => {
            const isDir = await isDirectory(`${dir}/${file}`)
            const path = isDir ? `${file}/` : file;
            const label = isDir ? `$(folder) ${path}` : `$(file) ${path}`;
            return {
                label,
                path,
                description: '',
                isDir
            }
        }))

        type Item = { path: string }
        const sortFn = (a: Item, b: Item) => a.path.localeCompare(b.path)

        const directories = items.filter((item) => item.isDir).sort(sortFn)
        const files = items.filter((item) => !item.isDir).sort(sortFn)

        const showCurrent = vscode.workspace.getConfiguration("vscode-tiller").get('showCurrentDirectory')

        const newItems = [{ label: '$(folder) ..', path: '..', description: '(parent directory)', isDir: true }]

        if (showCurrent) {
            newItems.push({ label: '$(folder) .', path: '.', description: '(current directory)', isDir: true })
        }

        newItems.push(...directories)
        newItems.push(...files)

        quickPick.placeholder = path.normalize(dir)
        quickPick.value = ''
        quickPick.items = newItems
        quickPick.show()
        quickPick.busy = false
    }
    catch (err) {
        vscode.window.showErrorMessage(err.message)
    }
}

export function setContext(state: boolean) {
    vscode.commands.executeCommand("setContext", "inTiller", state);
}
