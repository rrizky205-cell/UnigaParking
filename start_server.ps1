# ==============================================================================
# u.park by UNIGA - Simple Local Web Server
# Zero external dependencies (uses built-in .NET HttpListener in PowerShell)
# ==============================================================================

$port = 8080
$folder = $PSScriptRoot

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://*:$port/")

try {
    $listener.Start()
} catch {
    # If wildcard binding fails due to permissions, fallback to localhost
    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add("http://localhost:$port/")
    $listener.Start()
}

# Get local LAN IPv4 address for smartphone testing
$ipAddresses = [System.Net.Dns]::GetHostAddresses([System.Net.Dns]::GetHostName()) | 
    Where-Object { $_.AddressFamily -eq [System.Net.Sockets.AddressFamily]::InterNetwork }

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  u.park by UNIGA - Smart Parking & Booking Web App" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Server berhasil dijalankan!" -ForegroundColor Yellow
Write-Host "Buka di Laptop/Browser:  http://localhost:$port" -ForegroundColor White

if ($ipAddresses) {
    Write-Host "Buka di Smartphone (WiFi yang sama):" -ForegroundColor Yellow
    foreach ($ip in $ipAddresses) {
        Write-Host "  👉 http://$($ip.IPAddressToString):$port" -ForegroundColor Green
    }
}
Write-Host "`nTekan Ctrl+C di terminal ini untuk menghentikan server.`n" -ForegroundColor Gray

# Auto-open browser
Start-Process "http://localhost:$port"

while ($listener.IsListening) {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response

    $localPath = $request.Url.LocalPath.TrimStart('/')
    if ([string]::IsNullOrEmpty($localPath)) {
        $localPath = "index.html"
    }

    $filePath = Join-Path $folder $localPath

    if (Test-Path $filePath -PathType Leaf) {
        $bytes = [System.IO.File]::ReadAllBytes($filePath)
        $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
        
        switch ($ext) {
            ".html" { $response.ContentType = "text/html; charset=utf-8" }
            ".css"  { $response.ContentType = "text/css; charset=utf-8" }
            ".js"   { $response.ContentType = "application/javascript; charset=utf-8" }
            ".json" { $response.ContentType = "application/json; charset=utf-8" }
            ".png"  { $response.ContentType = "image/png" }
            ".svg"  { $response.ContentType = "image/svg+xml" }
            default { $response.ContentType = "application/octet-stream" }
        }

        $response.ContentLength64 = $bytes.Length
        $response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
        $response.StatusCode = 404
        $msg = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
        $response.OutputStream.Write($msg, 0, $msg.Length)
    }

    $response.Close()
}
