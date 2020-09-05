'use strict'
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
