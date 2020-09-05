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

import { Tiller } from "./types"
import { isDirectory, openSelected, updateQuickPick } from "./utils"

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