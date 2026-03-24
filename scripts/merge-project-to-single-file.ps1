param(
    [string]$RootPath = ".",
    [string]$OutputPath = "MindMitra_All_Files_Including_Node_Modules.txt",
    [string[]]$ExcludeDirectories = @(),
    [string[]]$ExcludeFiles = @()
)

$ErrorActionPreference = "Stop"

function Get-RelativePathCompat {
    param(
        [Parameter(Mandatory = $true)]
        [string]$BasePath,
        [Parameter(Mandatory = $true)]
        [string]$TargetPath
    )

    $base = [System.IO.Path]::GetFullPath($BasePath)
    if (-not $base.EndsWith([System.IO.Path]::DirectorySeparatorChar)) {
        $base += [System.IO.Path]::DirectorySeparatorChar
    }

    $baseUri = New-Object System.Uri($base)
    $targetUri = New-Object System.Uri([System.IO.Path]::GetFullPath($TargetPath))
    $relativeUri = $baseUri.MakeRelativeUri($targetUri)
    return [System.Uri]::UnescapeDataString($relativeUri.ToString()).Replace('/', '\')
}

function Test-IsBinaryFile {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path
    )

    $binaryExtensions = @(
        ".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico", ".bmp", ".pdf",
        ".zip", ".gz", ".tgz", ".7z", ".rar",
        ".exe", ".dll", ".so", ".dylib", ".class", ".jar",
        ".woff", ".woff2", ".ttf", ".eot",
        ".node", ".o", ".a", ".lib"
    )

    $extension = [System.IO.Path]::GetExtension($Path).ToLowerInvariant()
    if ($binaryExtensions -contains $extension) {
        return $true
    }

    try {
        $stream = [System.IO.File]::OpenRead($Path)
        try {
            $buffer = New-Object byte[] 4096
            $bytesRead = $stream.Read($buffer, 0, $buffer.Length)
            for ($i = 0; $i -lt $bytesRead; $i++) {
                if ($buffer[$i] -eq 0) {
                    return $true
                }
            }
        }
        finally {
            $stream.Dispose()
        }
    }
    catch {
        return $true
    }

    return $false
}

$root = (Resolve-Path $RootPath).Path
$output = Join-Path $root $OutputPath
$relativeOutputPath = Get-RelativePathCompat -BasePath $root -TargetPath $output
$excludedDirectoryPaths = @(
    $ExcludeDirectories |
    Where-Object { $_ -and $_.Trim() } |
    ForEach-Object { [System.IO.Path]::GetFullPath((Join-Path $root $_)) }
)
$excludedFilePaths = @(
    $ExcludeFiles |
    Where-Object { $_ -and $_.Trim() } |
    ForEach-Object { [System.IO.Path]::GetFullPath((Join-Path $root $_)) }
)

$files = Get-ChildItem -Path $root -Recurse -File |
    Where-Object {
        $isExcludedDirectory = $false
        foreach ($excludedPath in $excludedDirectoryPaths) {
            if ($_.FullName.StartsWith($excludedPath, [System.StringComparison]::OrdinalIgnoreCase)) {
                $isExcludedDirectory = $true
                break
            }
        }

        $isExcludedFile = $excludedFilePaths -contains $_.FullName

        $_.FullName -ne $output -and
        -not $isExcludedDirectory -and
        -not $isExcludedFile -and
        -not (Test-IsBinaryFile -Path $_.FullName)
    } |
    Sort-Object FullName

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$writer = New-Object System.IO.StreamWriter($output, $false, $utf8NoBom)

try {
    $writer.WriteLine("MindMitra Project Single File Export")
    $writer.WriteLine("Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')")
    $writer.WriteLine("Root: $root")
    $writer.WriteLine("Includes: project files + node_modules text files")
    $writer.WriteLine()

    foreach ($file in $files) {
        $relativePath = Get-RelativePathCompat -BasePath $root -TargetPath $file.FullName
        $separator = "=" * 100
        $writer.WriteLine($separator)
        $writer.WriteLine("FILE: $relativePath")
        $writer.WriteLine($separator)

        try {
            $writer.Write([System.IO.File]::ReadAllText($file.FullName))
        }
        catch {
            $writer.Write("[Skipped while reading: $($_.Exception.Message)]")
        }

        $writer.WriteLine()
        $writer.WriteLine()
    }
}
finally {
    $writer.Dispose()
}

Write-Output "Created: $relativeOutputPath"
Write-Output "Files merged: $($files.Count)"
