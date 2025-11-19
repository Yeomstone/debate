 =  D:/vs/Argu
 = D:/vs/Debate
 = @()
Get-ChildItem -Path  -Recurse -Filter *.css | ForEach-Object {
     = .FullName.Substring(.Length + 1)
     =  -replace 'ArguAdmin','DebateAdmin' -replace 'ArguUser','DebateUser' -replace 'argu','debate' -replace 'Argu','Debate'
     = Join-Path  
    if (-not (Test-Path )) {
         += [PSCustomObject]@{Argu=; Debate=}
    }
}
Write-Host ('Missing count: ' + .Count)
 | Format-Table -AutoSize
