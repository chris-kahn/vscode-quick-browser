import * as vscode from 'vscode'
import * as path from 'path'

import { Tiller } from "./types"
import { isDirectory, openSelected } from "./utils"
import { updateQuickPick } from "./updateQuickPick"

export function handleDidChangeValue(tiller: Tiller) {
    return async function (value: string) {
        if (value.length > 1 && value.slice(-1) === '/') {
            const newPath = path.normalize(tiller.quickPick.placeholder + '/' + value)
            const isDir = await isDirectory(newPath)
            if (isDir) {
                updateQuickPick(tiller, newPath)
            }
        }
    }
}

export function handleDidAccept(tiller: Tiller) {
    return async function () {
        try {
            openSelected(tiller)
        } catch (err) {
            vscode.window.showErrorMessage(err)
        }
    }
}