'use strict'
import * as vscode from 'vscode'

import { Tiller } from './types'
import { commandBack, commandForward, commandToggleHidden, commandShow } from './commands'
import { handleDidChangeValue, handleDidAccept } from './events'

export async function activate(context: vscode.ExtensionContext) {
    const tiller: Tiller = {
        quickPick: vscode.window.createQuickPick(),
        visible: false,
        showHidden: false
    }

    tiller.quickPick.onDidChangeValue(handleDidChangeValue(tiller))
    tiller.quickPick.onDidAccept(handleDidAccept(tiller))
    tiller.quickPick.onDidHide(() => {
        tiller.visible = false
    })

    const disposable = vscode.commands.registerCommand('tiller.show', commandShow(tiller))
    const back = vscode.commands.registerCommand('tiller.back', commandBack(tiller))
    const forward = vscode.commands.registerCommand('tiller.forward', commandForward(tiller))
    const toggleHidden = vscode.commands.registerCommand('tiller.toggleHidden', commandToggleHidden(tiller))

    context.subscriptions.push(disposable)
    context.subscriptions.push(back)
    context.subscriptions.push(forward)
    context.subscriptions.push(toggleHidden)
}

export function deactivate() { }
