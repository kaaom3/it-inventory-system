# ===================================================================
# PowerShell Script to Collect and Send Computer Inventory Data
# Version 24.11 - Cloud Sync + Skip Printers without S/N
# ===================================================================

# --- CONFIGURATION (ตั้งค่าสำหรับ Cloud) ---
# บังคับให้ Windows เก่า (Win 7, 8) ใช้ TLS 1.2 ในการเชื่อมต่อ
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

# 1. URL ของเว็บ Render.com (ไม่ต้องมี https://)
$serverIp = "it-inventory-system-ncd9.onrender.com" 

# 2. URL สำหรับส่งข้อมูลสเปคเครื่อง (ทำครั้งแรก)
$apiUrl = "https://$($serverIp)/api/inventory/sync"

# 3. URL สำหรับส่งสัญญาณ Heartbeat (ทำทุกๆ 5 นาที)
$heartbeatUrl = "https://$($serverIp)/api/heartbeat"

# 4. API Key (ต้องตรงกับตัวแปร API_SECRET_KEY ในไฟล์ index.js)
$apiKey = "KAAOM321A" 

# 5. ระบุสถานที่ของเครื่องนี้ (จะไปโผล่ในฟิลด์ Location)
$location = "Office_Building_A" 

# 🌟 6. บังคับเลือกหมวดหมู่ (Force Category) 
# ปล่อยเป็น "" เพื่อให้ระบบแยกอัตโนมัติ หรือใส่ "POS" เพื่อบังคับให้อุปกรณ์นี้เข้าหมวด POS บนเว็บ
$forceCategory = ""

# ไฟล์ Log สำหรับตรวจสอบการทำงาน
$logFilePath = "C:\Temp\inventory_log.txt"

# --- FUNCTIONS ---
function Write-Log {
    param ([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] $Message"
    try {
        if (-not (Test-Path (Split-Path $logFilePath -Parent))) {
            New-Item -ItemType Directory -Path (Split-Path $logFilePath -Parent) -Force | Out-Null
        }
        Add-Content -Path $logFilePath -Value $logMessage -ErrorAction Stop
    } catch {}
    Write-Host $logMessage 
}

# ฟังก์ชันทำความสะอาดข้อมูล ลบตัวอักษรขยะและ Null Bytes
function Clean-Data {
    param ([string]$InputString)
    if ([string]::IsNullOrWhiteSpace($InputString)) { return "N/A" }
    # ลบ Null Character และช่องว่างหัวท้าย
    $cleaned = $InputString -replace [char]0, '' -replace '', ''
    return $cleaned.Trim()
}

function Convert-PnpIdTo-ManufacturerName {
    param ([string]$PnpId)
    $pnpLookup = @{
        "AAC"="Acer"; "ACR"="Acer"; "AOC"="AOC"; "APP"="Apple"; "AUO"="AU Optronics";
        "BEN"="BenQ"; "CMO"="Chi Mei"; "DEL"="Dell"; "HEI"="Heier"; "HPN"="HP-Compaq";
        "HPQ"="HP"; "HWP"="HP"; "IVM"="IBM"; "LEN"="Lenovo"; "LGD"="LG Display";
        "LPL"="LG Philips"; "NEC"="NEC"; "PHL"="Philips"; "SAM"="Samsung"; "SEC"="Samsung";
        "SNY"="Sony"; "TOS"="Toshiba"; "TSB"="Toshiba"; "VIZ"="Vizio"; "VSC"="ViewSonic"
    }
    if ($pnpLookup.ContainsKey($PnpId)) { return $pnpLookup[$PnpId] } else { return $PnpId }
}

# ===================================================================
# PART 1: INVENTORY SYNC (รวบรวมข้อมูลสเปคคอมพิวเตอร์)
# ===================================================================
Write-Log "========== Script Run Started (v24.11) =========="
Write-Log "Target Server: $apiUrl"

try {
    # Test Connection to Cloud
    Write-Log "Testing connection to server..."
    $testConnection = Test-NetConnection -ComputerName $serverIp -Port 443 -InformationLevel Quiet
    if (-not $testConnection) {
        throw "Cannot connect to server at $serverIp. Please check internet connection."
    }

    # 1. Collect Basic Info
    $computerSystem = Get-CimInstance -ClassName Win32_ComputerSystem
    $osInfo = Get-CimInstance -ClassName Win32_OperatingSystem
    $cpuInfo = Get-CimInstance -ClassName Win32_Processor
    $biosInfo = Get-CimInstance -ClassName Win32_BIOS
    $ramGB = [math]::Round($computerSystem.TotalPhysicalMemory / 1GB, 2)
    $computerName = $env:COMPUTERNAME
    
    # Logic หา Username ปัจจุบัน
    $userName = ($computerSystem.UserName -split '\\')[-1]
    if (-not $userName) { $userName = $env:USERNAME } # Fallback
    
    $cleanSerial = Clean-Data $biosInfo.SerialNumber
    $cleanModel = Clean-Data $computerSystem.Model
    $cleanManuf = Clean-Data $computerSystem.Manufacturer
    
    Write-Log "Collected info for: $computerName (User: $userName)"
    
    # 2. Disk Size
    $diskSizeString = (Get-CimInstance -ClassName Win32_LogicalDisk -Filter "DriveType=3" | ForEach-Object {
        "$($_.DeviceID) $([math]::Round($_.Size / 1GB, 0)) GB"
    }) -join ', '
    if (-not $diskSizeString) { $diskSizeString = "N/A" }
    
    # 3. IP Address
    $localIp = (Get-CimInstance Win32_NetworkAdapterConfiguration | Where-Object { $_.IPEnabled -and $_.DefaultIPGateway }).IPAddress[0]
    if (-not $localIp) { $localIp = "N/A" }

    # 4. Computer Type Detection (เพิ่มระบบ Force Category)
    $computerType = "Unknown"
    
    if (-not [string]::IsNullOrWhiteSpace($forceCategory)) {
        # กรณีมีการบังคับหมวดหมู่จากตั้งค่าด้านบน
        $computerType = $forceCategory.Trim()
        Write-Log "Using forced custom category: $computerType"
    } elseif ($computerName -like '*POS*') {
        $computerType = "POS"
    } else {
        try {
            $chassisTypes = (Get-CimInstance -ClassName Win32_SystemEnclosure).ChassisTypes
            if ($chassisTypes -contains 3..7 -or $chassisTypes -contains 13 -or $chassisTypes -contains 15 -or $chassisTypes -contains 24) { $computerType = "Desktop" } 
            elseif ($chassisTypes -contains 8..12 -or $chassisTypes -contains 14) { $computerType = "Laptop" } 
            elseif ($chassisTypes -contains 30..32) { $computerType = "Tablet" } 
            elseif ($chassisTypes -contains 17..23) { $computerType = "Server" }
        } catch {}

        if ($computerType -eq "Unknown") {
            try {
                switch ($computerSystem.PCSystemType) {
                    1 { $computerType = "Desktop" } 2 { $computerType = "Laptop" } 3 { $computerType = "Desktop" }
                    4 { $computerType = "Server" } 5 { $computerType = "Server" } 6 { $computerType = "Desktop" }
                    7 { $computerType = "Server" } 8 { $computerType = "Tablet" }
                }
            } catch {}
        }
    }
    
    # 5. Monitor Info
    $monitorList = @()
    try {
        $monitorsWmi = Get-WmiObject -Namespace root\wmi -Class WmiMonitorID
        $monitorParams = Get-WmiObject -Namespace root\wmi -Class WmiMonitorConnectionParams -ErrorAction SilentlyContinue

        if ($monitorsWmi) {
             if ($monitorsWmi -isnot [array]) { $monitorsWmi = @($monitorsWmi) }
             foreach ($monitor in $monitorsWmi) {
                $isInternal = $false
                if (($computerType -eq "Laptop" -or $computerType -eq "Tablet") -and $monitorParams) {
                    $conn = $monitorParams | Where-Object { $_.InstanceName -eq $monitor.InstanceName }
                    if ($conn) {
                        $tech = $conn.VideoOutputTechnology
                        if ($tech -eq 0 -or $tech -eq 7 -or $tech -eq 11 -or $tech -eq -2147483648) { $isInternal = $true }
                    }
                }

                if (-not $isInternal) {
                    $manuf = (Convert-PnpIdTo-ManufacturerName -PnpId (($monitor.ManufacturerName | Where-Object { $_ -ne 0 } | % {[char]$_}) -join '').Trim())
                    $mod = (($monitor.UserFriendlyName | Where-Object { $_ -ne 0 } | % {[char]$_}) -join '').Trim()
                    $ser = (($monitor.SerialNumberID | Where-Object { $_ -ne 0 } | % {[char]$_}) -join '').Trim()
                    
                    if ((Clean-Data $ser)) {
                        $monitorList += [PSCustomObject]@{ manufacturer = (Clean-Data $manuf); model = (Clean-Data $mod); serial = (Clean-Data $ser); ComputerName = $computerName; AssignedComputer = $computerName; UserName = $userName }
                    }
                }
            }
        }
    } catch { Write-Log "Monitor info warning: $_" }
    
    # 6. Software
    $softwareList = Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\*", "HKLM:\SOFTWARE\Wow6432Node\Microsoft\Windows\CurrentVersion\Uninstall\*" | 
        Where-Object { $_.DisplayName -and !$_.SystemComponent } | 
        Select-Object @{N="name";E={Clean-Data $_.DisplayName}}, @{N="version";E={Clean-Data $_.DisplayVersion}}

    # 7. Accessories (🌟 แยก Keyboards และ Mice ออกจากกัน)
    $keyboardList = @()
    $mouseList = @()
    try {
        Get-CimInstance -ClassName Win32_Keyboard | ForEach-Object {
            $desc = $_.Description; $devId = $_.DeviceID
            if ($devId -notlike "ACPI*" -and $desc -notlike "*PS/2*" -and $devId -notlike "USB*") {
                $keyboardList += [PSCustomObject]@{ AccessoryType = "Keyboard"; Model = (Clean-Data "$desc [External]"); SerialNumber = (Clean-Data $devId); Manufacturer = "Generic"; ComputerName = $computerName; AssignedComputer = $computerName; UserName = $userName }
            }
        }
        Get-CimInstance -ClassName Win32_PointingDevice | ForEach-Object {
            $desc = $_.Description; $devId = $_.DeviceID; $manuf = $_.Manufacturer
            if ($devId -notlike "ACPI*" -and $desc -notlike "*TouchPad*" -and $desc -notlike "*PS/2*" -and $devId -notlike "USB*") {
                $mouseList += [PSCustomObject]@{ AccessoryType = "Mouse"; Model = (Clean-Data "$desc [External]"); SerialNumber = (Clean-Data $devId); Manufacturer = (Clean-Data $manuf); ComputerName = $computerName; AssignedComputer = $computerName; UserName = $userName }
            }
        }
    } catch { Write-Log "Accessory info warning: $_" }
    
    # 8. Printers (🌟 ถ้าไม่มี S/N จะไม่ดึงมาเด็ดขาด)
    $printerList = @()
    try {
        # กรองเอาเฉพาะ Printer ที่ใช้พอร์ต USB หรือ ESDPRT
        Get-CimInstance -ClassName Win32_Printer | ? { 
            ($_.PortName -like "USB*" -or $_.PortName -like "ESDPRT*") -and
            $_.Name -notlike "*Microsoft*" -and 
            $_.Name -notlike "*OneNote*" -and 
            $_.Name -notlike "*PDF*" -and 
            $_.Name -notlike "*XPS*" -and
            $_.Name -notlike "*Webex*" -and
            $_.Name -notlike "*Fax*" -and
            $_.WorkOffline -eq $false -and     
            $_.PrinterStatus -ne 7 # แบนเฉพาะสถานะ Offline จริงๆ เท่านั้น
        } | % {
            $p = $_
            $pnpDevice = $null
            # พยายามหาข้อมูล PnP ระดับฮาร์ดแวร์ของปริ้นเตอร์ (หลีกเลี่ยง Regex Error)
            try { 
                $safeName = [regex]::Escape($p.Name)
                $pnpDevice = Get-CimInstance -ClassName Win32_PnPEntity | ? { $_.Name -match $safeName -or $safeName -match $_.Name } | Select -First 1 
            } catch {}
            
            # ถ้า PnP Error Code ไม่ใช่ 0 (เช่น Code 45 คือถอดสายไปแล้ว) ให้ข้าม
            if ($pnpDevice -and $pnpDevice.ConfigManagerErrorCode -ne 0) {
                return 
            }
            
            $sn = if($pnpDevice -and $pnpDevice.PNPDeviceID) { ($pnpDevice.PNPDeviceID -split '\\')[-1] } else { "N/A" }
            
            # 🌟 ถ้าไม่มี S/N จริงๆ จากฮาร์ดแวร์ (เช่น ไดรเวอร์ค้างแต่ตัวเครื่องถอดไปแล้ว) ให้ข้ามเลย ไม่ต้องดึงมา
            if ($sn -eq "N/A" -or [string]::IsNullOrWhiteSpace($sn)) {
                return 
            }

            $printerList += [PSCustomObject]@{
                Name = Clean-Data $p.Name
                Manufacturer = if($pnpDevice -and $pnpDevice.Manufacturer){Clean-Data $pnpDevice.Manufacturer}else{"Unknown"}
                Model = Clean-Data $p.DriverName 
                DriverName = Clean-Data $p.DriverName
                PortName = Clean-Data $p.PortName
                SerialNumber = Clean-Data $sn
                ComputerName = $computerName
                AssignedComputer = $computerName
                UserName = $userName
            }
        }
    } catch { Write-Log "Printer info warning: $_" }

    # --- Construct Payload ---
    $inventoryData = [PSCustomObject]@{
        computerName = $computerName
        manufacturer = $cleanManuf
        model = $cleanModel
        serialNumber = $cleanSerial
        type = $computerType
        location = $location
        userName = $userName
        cpu = Clean-Data $cpuInfo.Name
        ramGB = $ramGB
        diskSizeGB = $diskSizeString
        os = Clean-Data $osInfo.Caption
        ipAddress = $localIp
        monitors = $monitorList
        software = $softwareList
        keyboards = $keyboardList
        mice = $mouseList
        printers = $printerList
        warrantyStartDate = ""
        warrantyEndDate = ""
    }

    # --- Send Data ---
    $jsonData = $inventoryData | ConvertTo-Json -Depth 5
    Write-Log "Sending inventory data to $apiUrl..."
    
    $headers = @{ "Content-Type" = "application/json"; "x-api-key" = $apiKey }
    
    try {
        $response = Invoke-RestMethod -Uri $apiUrl -Method Post -Body $jsonData -Headers $headers -ErrorAction Stop
        
        if ($response.status -eq "success") { 
            Write-Log "SUCCESS! Full Data synced." 
            Write-Host "Sync Complete!" -ForegroundColor Green
        } else { 
            Write-Log "SERVER ERROR: $($response.message)" 
            Write-Host "Server Error: $($response.message)" -ForegroundColor Yellow
        }
    } catch {
        Write-Log "REQUEST FAILED: $($_.Exception.Message)"
        Write-Host "Request Failed: $($_.Exception.Message)" -ForegroundColor Red
    }

} catch {
    Write-Log "CRITICAL ERROR: $($_.Exception.Message)"
    Write-Host "Critical Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Log "========== Full Sync Finished =========="


# ===================================================================
# PART 2: HEARTBEAT MONITOR (ส่งสัญญาณออนไลน์ทุกๆ 5 นาที)
# ===================================================================
Write-Log "Starting Heartbeat Service. This window will remain open in background."
Write-Host "Entering Heartbeat Mode. Press Ctrl+C to stop." -ForegroundColor Cyan

# 🌟 กำหนดชื่อหมวดหมู่ปลายทางตามประเภทของเครื่อง (ส่งกลับไปให้ Heartbeat)
$targetCollection = if ($computerType -and $computerType -ne "Unknown") { $computerType } else { "Computers" }

while ($true) {
    try {
        # สร้างข้อมูลแบบย่อส่งไปอัปเดตสถานะ Online
        $heartbeatBody = @{
            hostname = $env:COMPUTERNAME
            collectionName = $targetCollection
        } | ConvertTo-Json -Compress

        Invoke-RestMethod -Uri $heartbeatUrl -Method Post -Body $heartbeatBody -ContentType "application/json" -ErrorAction Stop
        Write-Log "Heartbeat sent successfully."
        Write-Host "[$((Get-Date).ToString('HH:mm:ss'))] Online status sent." -ForegroundColor Green
    } catch {
        Write-Log "Heartbeat failed: $($_.Exception.Message)"
        Write-Host "[$((Get-Date).ToString('HH:mm:ss'))] Heartbeat failed." -ForegroundColor Red
    }
    
    # รอ 5 นาที (300 วินาที) ก่อนส่งรอบถัดไป
    Start-Sleep -Seconds 1500
}