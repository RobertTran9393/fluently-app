$desktop = [Environment]::GetFolderPath('Desktop')
$currentDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$targetBat = Join-Path $currentDir "CHAY_APP.bat"
$shortcutPath = Join-Path $desktop "Fluently - Hoc Tieng Anh.lnk"

$wsh = New-Object -ComObject WScript.Shell
$shortcut = $wsh.CreateShortcut($shortcutPath)
$shortcut.TargetPath = "$env:SystemRoot\system32\cmd.exe"
$shortcut.Arguments = "/c `"`"$targetBat`"`""
$shortcut.WorkingDirectory = $currentDir
$shortcut.IconLocation = "shell32.dll,14"
$shortcut.Description = "Chay Web App Hoc Tieng Anh Fluently"
$shortcut.Save()

Write-Host "Created shortcut successfully at: $shortcutPath"
Write-Host "Target: $targetBat"
