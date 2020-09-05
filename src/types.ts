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

export type TillerItem = vscode.QuickPickItem & { path: string }

export type Tiller = {
    quickPick: vscode.QuickPick<TillerItem>
    visible: boolean
    showHidden: boolean
}