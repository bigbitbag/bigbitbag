$ErrorActionPreference = "Stop"

# 仅生成 _sidebar.md 和 IMAGES.md，不执行 git add、commit 或 push。
$Root = (Resolve-Path -LiteralPath $PSScriptRoot).Path.TrimEnd([char[]]@('\', '/'))
$IgnoredDirNames = @(".git", ".github", ".vscode", "node_modules", "vendor", "bin", "obj")
$ImageExtensions = @(".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".bmp", ".avif", ".tif", ".tiff")

function Get-RelativePath([string]$FullPath) {
    $relative = $FullPath.Substring($Root.Length).TrimStart([char[]]@('\', '/'))
    return $relative.Replace('\', '/')
}

function Test-IgnoredPath([string]$FullPath) {
    $relative = Get-RelativePath $FullPath
    foreach ($part in ($relative -split '/')) {
        if ($part.StartsWith('.') -or ($IgnoredDirNames -contains $part)) {
            return $true
        }
    }
    return $false
}

function Get-UrlPath([string]$FullPath) {
    $relative = Get-RelativePath $FullPath
    $parts = $relative -split '/'
    return (($parts | ForEach-Object { [System.Uri]::EscapeDataString($_) }) -join '/')
}

function Escape-MarkdownLabel([string]$Text) {
    return $Text.Replace('\', '\\').Replace('[', '\[').Replace(']', '\]')
}

function Get-MarkdownTitle([string]$Path, [string]$Fallback) {
    $lines = Get-Content -LiteralPath $Path -Encoding UTF8
    foreach ($line in ($lines | Select-Object -First 80)) {
        if ($line -match '^\s{0,3}#\s+(.+?)\s*$') {
            return $Matches[1].Trim()
        }
    }
    return $Fallback
}

$AllMarkdown = @(
    Get-ChildItem -LiteralPath $Root -Recurse -File -Filter "*.md" |
    Where-Object {
        -not (Test-IgnoredPath $_.FullName) -and
        $_.Name -ne "_sidebar.md" -and
        $_.Name -ne "IMAGES.md"
    }
)

function Get-FolderMarkdown([string]$Dir) {
    $prefix = (Get-RelativePath $Dir).TrimEnd('/') + '/'
    return @(
        $AllMarkdown | Where-Object {
            $relative = Get-RelativePath $_.FullName
            $relative.StartsWith($prefix, [System.StringComparison]::OrdinalIgnoreCase)
        }
    )
}

$Sidebar = New-Object 'System.Collections.Generic.List[string]'
$Sidebar.Add("- [首页](/)")
$Sidebar.Add("- [图片索引](IMAGES.md)")
$Sidebar.Add("")

# 根目录 Markdown 页面（首页、README、自动生成文件除外）
$RootFiles = @(
    $AllMarkdown | Where-Object {
        $_.DirectoryName -eq $Root -and
        $_.Name -notin @("HOME.md", "README.md")
    } | Sort-Object Name
)

foreach ($file in $RootFiles) {
    $title = Escape-MarkdownLabel (Get-MarkdownTitle $file.FullName ([System.IO.Path]::GetFileNameWithoutExtension($file.Name)))
    $url = Get-UrlPath $file.FullName
    $Sidebar.Add("- [$title]($url)")
}

function Add-FolderToSidebar([string]$Dir, [string]$Indent) {
    $folderMarkdown = @(Get-FolderMarkdown $Dir)
    if ($folderMarkdown.Count -eq 0) { return }

    $folderName = Split-Path -Leaf $Dir
    $readme = $folderMarkdown |
        Where-Object { $_.DirectoryName -eq $Dir -and $_.Name -ieq "README.md" } |
        Select-Object -First 1

    if ($null -ne $readme) {
        $title = Escape-MarkdownLabel (Get-MarkdownTitle $readme.FullName $folderName)
        $url = Get-UrlPath $readme.FullName
        $Sidebar.Add("${Indent}- [$title]($url)")
    } else {
        $Sidebar.Add("${Indent}- $folderName")
    }

    $directFiles = @(
        $folderMarkdown | Where-Object {
            $_.DirectoryName -eq $Dir -and $_.Name -ine "README.md"
        } | Sort-Object Name
    )

    foreach ($file in $directFiles) {
        $title = Escape-MarkdownLabel (Get-MarkdownTitle $file.FullName ([System.IO.Path]::GetFileNameWithoutExtension($file.Name)))
        $url = Get-UrlPath $file.FullName
        $Sidebar.Add("${Indent}  - [$title]($url)")
    }

    $childFolders = @(
        Get-ChildItem -LiteralPath $Dir -Directory |
        Where-Object {
            -not (Test-IgnoredPath $_.FullName) -and
            (Get-FolderMarkdown $_.FullName).Count -gt 0
        } | Sort-Object Name
    )

    foreach ($child in $childFolders) {
        Add-FolderToSidebar $child.FullName ($Indent + "  ")
    }
}

$TopFolders = @(
    Get-ChildItem -LiteralPath $Root -Directory |
    Where-Object {
        -not (Test-IgnoredPath $_.FullName) -and
        (Get-FolderMarkdown $_.FullName).Count -gt 0
    } | Sort-Object Name
)

foreach ($folder in $TopFolders) {
    Add-FolderToSidebar $folder.FullName ""
}

$Utf8NoBom = New-Object System.Text.UTF8Encoding -ArgumentList $false
$sidebarText = ($Sidebar -join "`r`n") + "`r`n"
[System.IO.File]::WriteAllText((Join-Path $Root "_sidebar.md"), $sidebarText, $Utf8NoBom)

# 生成图片索引：展示常见图片格式的缩略预览、文件名和相对路径。
$Images = @(
    Get-ChildItem -LiteralPath $Root -Recurse -File |
    Where-Object {
        ($ImageExtensions -contains $_.Extension.ToLowerInvariant()) -and
        -not (Test-IgnoredPath $_.FullName)
    } | Sort-Object FullName
)

$ImageLines = New-Object 'System.Collections.Generic.List[string]'
$ImageLines.Add("# 图片索引")
$ImageLines.Add("")
$ImageLines.Add("> 本页由本地脚本自动生成。新增或删除图片后，重新运行脚本即可更新。")
$ImageLines.Add("")

if ($Images.Count -eq 0) {
    $ImageLines.Add("目前还没有找到 PNG、JPG、JPEG、GIF、WEBP、SVG、BMP、AVIF 或 TIFF 图片。")
} else {
    $LastFolder = $null
    foreach ($image in $Images) {
        $relative = Get-RelativePath $image.FullName
        $relativeDir = Split-Path -Path $relative -Parent
        if ([string]::IsNullOrWhiteSpace($relativeDir) -or $relativeDir -eq ".") {
            $relativeDir = "根目录"
        }

        if ($relativeDir -ne $LastFolder) {
            if ($ImageLines.Count -gt 4) { $ImageLines.Add("") }
            $ImageLines.Add("## $relativeDir")
            $ImageLines.Add("")
            $LastFolder = $relativeDir
        }

        $url = Get-UrlPath $image.FullName
        $urlHtml = [System.Net.WebUtility]::HtmlEncode($url)
        $nameHtml = [System.Net.WebUtility]::HtmlEncode($image.Name)
        $label = Escape-MarkdownLabel $image.Name

        $ImageLines.Add("<a href=`"$urlHtml`" target=`"_blank`"><img src=`"$urlHtml`" alt=`"$nameHtml`" loading=`"lazy`" style=`"max-width:280px;max-height:220px;object-fit:contain;`"></a>")
        $ImageLines.Add("")
        $ImageLines.Add("[$label]($url)")
        $ImageLines.Add("")
    }
}

$imageText = ($ImageLines -join "`r`n") + "`r`n"
[System.IO.File]::WriteAllText((Join-Path $Root "IMAGES.md"), $imageText, $Utf8NoBom)

Write-Host ""
Write-Host "完成：已生成 _sidebar.md 和 IMAGES.md。" -ForegroundColor Green
Write-Host "此脚本只生成本地文件，没有执行任何 Git 命令，也没有上传文件。"
Write-Host "请检查生成结果，再按自己的 Git 流程提交和推送。"
