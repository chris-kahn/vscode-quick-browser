import * as vscode from 'vscode'
import * as path from 'path'
import { readdir, isDirectory } from './utils'
import { Tiller } from './types'

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