<#
.SYNOPSIS
สคริปต์นี้ทำหน้าที่เป็น "ตัวแทน (Relay Agent)" รันบนคอมพิวเตอร์ในวง LAN เดียวกันกับอุปกรณ์ (เช่น Switch, CCTV, Printer)
เพื่อดึงรายการ IP จาก Cloud Server มา Ping ทดสอบ แล้วส่งสถานะกลับไปอัปเดตบนเว็บ
#>

$serverUrl = "https://it-inventory-system-ncd9.onrender.com"
$apiKey = "KAAOM321A"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   IT Inventory - Local Ping Relay Agent  " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Target Server: $serverUrl"
Write-Host "Press Ctrl+C to stop the service."
Write-Host ""

while ($true) {
    try {
        Write-Host "[$((Get-Date).ToString('HH:mm:ss'))] Fetching IP devices from Cloud..." -ForegroundColor Yellow
        
        # 1. ขอรายการอุปกรณ์ที่มี IP Address จากเซิร์ฟเวอร์
        $devices = Invoke-RestMethod -Uri "$serverUrl/api/relay/devices" -Headers @{"x-api-key"=$apiKey} -Method Get -ErrorAction Stop
        
        if ($null -eq $devices -or $devices.Count -eq 0) {
            Write-Host "[$((Get-Date).ToString('HH:mm:ss'))] No IP devices found in database." -ForegroundColor DarkGray
        } else {
            Write-Host "[$((Get-Date).ToString('HH:mm:ss'))] Found $($devices.Count) devices. Pinging..." -ForegroundColor Yellow
            
            $onlineDevices = @()
            
            # 2. ทำการ Ping เช็คสถานะทีละเครื่องผ่าน LAN ภายใน
            foreach ($dev in $devices) {
                $ip = $dev.IPAddress
                $name = $dev.Name
                
                if ([string]::IsNullOrWhiteSpace($ip) -or $ip -eq "N/A") { continue }
                
                # ทดสอบ Ping (ส่งแพ็กเกจ 1 ครั้ง รอรับผล 1 วินาที)
                $isAlive = Test-Connection -ComputerName $ip -Count 1 -Quiet -ErrorAction SilentlyContinue
                
                if ($isAlive) {
                    Write-Host "  [ONLINE]  $name ($ip)" -ForegroundColor Green
                    $onlineDevices += @{
                        id = $dev._id
                        collection = $dev.collection
                    }
                } else {
                    Write-Host "  [OFFLINE] $name ($ip)" -ForegroundColor Red
                }
            }
            
            # 3. ส่งรายการอุปกรณ์ที่ "ออนไลน์" กลับไปบอก Server ให้อัปเดตสถานะ
            if ($onlineDevices.Count -gt 0) {
                $body = @{ devices = $onlineDevices } | ConvertTo-Json -Depth 3
                
                $response = Invoke-RestMethod -Uri "$serverUrl/api/relay/heartbeat" -Method Post -Body $body -Headers @{"x-api-key"=$apiKey; "Content-Type"="application/json"} -ErrorAction Stop
                Write-Host "[$((Get-Date).ToString('HH:mm:ss'))] Successfully reported $($onlineDevices.Count) online devices to Cloud." -ForegroundColor Green
            } else {
                Write-Host "[$((Get-Date).ToString('HH:mm:ss'))] No devices are currently online." -ForegroundColor DarkGray
            }
        }
    } catch {
        Write-Host "[$((Get-Date).ToString('HH:mm:ss'))] Error connecting to server: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host "Waiting 5 minutes before next cycle..." -ForegroundColor DarkGray
    Write-Host "------------------------------------------"
    Start-Sleep -Seconds 300
}