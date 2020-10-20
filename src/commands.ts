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
import * as path from 'path'
import { Tiller } from './types'
import { openSelected, updateQuickPick, setContext } from './utils'

const home: string = path.normalize(
    process.env[process.platform === 'win32' ? 'USERPROFILE' : 'HOME'] || '/'
)

export function commandShow(tiller: Tiller) {
    return async function handleCommandShow() {
        setContext(true);
        const { window, workspace } = vscode
        const { workspaceFolders } = workspace
        let editor = window.activeTextEditor
        let dir = home
        let initialSelection = []

        if (editor && editor.document.uri.scheme === 'file') {
            const { fsPath } = editor.document.uri
            dir = path.dirname(fsPath)
            initialSelection.push({ label: editor.document.fileName, path: editor.document.fileName })
        }
        else if (workspaceFolders && workspaceFolders.length > 0) {
            dir = workspaceFolders[0].uri.fsPath
        }

        tiller.quickPick.selectedItems = initialSelection

        await updateQuickPick(tiller, dir);
        tiller.visible = true;
    }
}

export function commandBack(tiller: Tiller) {
    return async function handleCommandBack() {
        try {
            if (tiller.visible) {
                const parent = path.normalize(tiller.quickPick.placeholder + '/..')
                updateQuickPick(tiller, parent)
            }
        } catch (e) {
            vscode.window.showErrorMessage(e.message)
        }
    }
}

export function commandForward(tiller: Tiller) {
    return async function handleCommandForward() {
        try {
            if (tiller.visible) {
                openSelected(tiller)
            }
        } catch (e) {
            vscode.window.showErrorMessage(e.message)
        }
    }
}

export function commandToggleHidden(tiller: Tiller) {
    return async function handleCommandToggleHidden() {
        try {
            if (tiller.visible) {
                tiller.showHidden = !tiller.showHidden
                await updateQuickPick(tiller, tiller.quickPick.placeholder || home)
            }
        } catch (e) {
            vscode.window.showErrorMessage(e.message)
        }
    }
}
