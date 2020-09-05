import * as vscode from 'vscode'
import * as path from 'path'
import { Tiller } from './types'
import { updateQuickPick } from './updateQuickPick'
import { openSelected } from './utils'

const home: string = path.normalize(
    process.env[process.platform === 'win32' ? 'USERPROFILE' : 'HOME'] || '/'
)

export function commandShow(tiller: Tiller) {
    return async function handleCommandShow() {
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