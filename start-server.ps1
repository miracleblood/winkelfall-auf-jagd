# Kleiner lokaler Webserver fuer "Winkelfall auf Jagd"
# Start:  powershell -ExecutionPolicy Bypass -File start-server.ps1
# Dann im Browser oeffnen: http://localhost:8137
param([int]$Port = 8137)
$ErrorActionPreference = "Stop"

$root = $PSScriptRoot
$types = @{
  '.html' = 'text/html; charset=utf-8'; '.js' = 'text/javascript; charset=utf-8'
  '.css' = 'text/css; charset=utf-8'; '.svg' = 'image/svg+xml'; '.png' = 'image/png'
  '.json' = 'application/json'; '.webmanifest' = 'application/manifest+json'
}
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Host "Winkelfall auf Jagd laeuft auf http://localhost:$Port  (Strg+C zum Beenden)"
while ($listener.IsListening) {
  $ctx = $listener.GetContext()
  $path = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath).TrimStart('/')
  if ($path -eq '') { $path = 'index.html' }
  $file = [System.IO.Path]::GetFullPath((Join-Path $root $path))
  if ($file.StartsWith($root) -and (Test-Path $file -PathType Leaf)) {
    $bytes = [System.IO.File]::ReadAllBytes($file)
    $ext = [System.IO.Path]::GetExtension($file).ToLower()
    $ctx.Response.ContentType = $(if ($types[$ext]) { $types[$ext] } else { 'application/octet-stream' })
    $ctx.Response.Headers.Add('Cache-Control', 'no-cache')
    $ctx.Response.ContentLength64 = $bytes.Length
    if ($ctx.Request.HttpMethod -ne 'HEAD') {
      try { $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length) } catch { }
    }
  } else {
    $ctx.Response.StatusCode = 404
  }
  try { $ctx.Response.Close() } catch { }
}
