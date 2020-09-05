'use strict'
import * as vscode from 'vscode'

export type TillerItem = vscode.QuickPickItem & { path: string }

export type Tiller = {
    quickPick: vscode.QuickPick<TillerItem>
    visible: boolean
    showHidden: boolean
}