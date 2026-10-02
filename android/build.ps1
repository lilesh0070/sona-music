param([string]$Sdk=$env:ANDROID_HOME,[string]$Jdk=$env:JAVA_HOME)
$ErrorActionPreference='Stop'
$taskRoot=$PSScriptRoot
if (!$Sdk -or !$Jdk) { throw 'Set ANDROID_HOME and JAVA_HOME before building.' }
$taskTools=Join-Path $Sdk 'build-tools\36.0.0'
$taskPlatform=Join-Path $Sdk 'platforms\android-35\android.jar'
$taskBuild=Join-Path $taskRoot 'build'
$taskSigning=Join-Path $taskRoot 'signing'
New-Item -ItemType Directory -Force -Path $taskBuild,"$taskBuild\classes","$taskBuild\dex","$taskRoot\res\drawable",$taskSigning | Out-Null
Copy-Item -LiteralPath "$taskRoot\..\public\icon-192.png" -Destination "$taskRoot\res\drawable\icon.png" -Force
function Run-Tool([string]$tool,[string[]]$arguments) {
 & $tool @arguments
 if($LASTEXITCODE -ne 0){throw "Android tool failed: $tool"}
}
$taskVersion=(Get-Content "$taskRoot\..\package.json" -Raw | ConvertFrom-Json).version
$taskParts=$taskVersion.Split('.')
$taskCode=([int]$taskParts[0]*10000)+([int]$taskParts[1]*100)+[int]$taskParts[2]
$taskManifest=(Get-Content "$taskRoot\AndroidManifest.xml" -Raw) -replace 'android:versionCode="\d+"',"android:versionCode=`"$taskCode`"" -replace 'android:versionName="[^"]+"',"android:versionName=`"$taskVersion`""
Set-Content "$taskBuild\AndroidManifest.xml" $taskManifest -Encoding utf8
Run-Tool "$taskTools\aapt.exe" @('package','-f','-M',"$taskBuild\AndroidManifest.xml",'-S',"$taskRoot\res",'-I',$taskPlatform,'-F',"$taskBuild\unsigned.apk")
$taskJava=@(Get-ChildItem "$taskRoot\src" -Filter '*.java' -Recurse | ForEach-Object FullName)
Run-Tool "$Jdk\bin\javac.exe" (@('--release','8','-encoding','UTF-8','-classpath',$taskPlatform,'-d',"$taskBuild\classes")+$taskJava)
$taskClass=@(Get-ChildItem "$taskBuild\classes" -Filter '*.class' -Recurse | ForEach-Object FullName)
Run-Tool "$taskTools\d8.bat" (@('--lib',$taskPlatform,'--min-api','26','--output',"$taskBuild\dex")+$taskClass)
Add-Type -AssemblyName System.IO.Compression.FileSystem
$taskZip=[IO.Compression.ZipFile]::Open("$taskBuild\unsigned.apk",'Update')
try { [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($taskZip,"$taskBuild\dex\classes.dex",'classes.dex',[IO.Compression.CompressionLevel]::Optimal) | Out-Null } finally {$taskZip.Dispose()}
Run-Tool "$taskTools\zipalign.exe" @('-P','16','-f','4',"$taskBuild\unsigned.apk","$taskBuild\aligned.apk")
$taskKey="$taskSigning\vibe-release.jks"
$taskPassword="$taskSigning\password.txt"
if(!(Test-Path -LiteralPath $taskKey)){
 if(!(Test-Path -LiteralPath $taskPassword)){
  $taskBytes=New-Object byte[] 32
  [Security.Cryptography.RandomNumberGenerator]::Fill($taskBytes)
  [IO.File]::WriteAllText($taskPassword,[Convert]::ToBase64String($taskBytes))
 }
 Run-Tool "$Jdk\bin\keytool.exe" @('-genkeypair','-keystore',$taskKey,'-storepass:file',$taskPassword,'-keypass:file',$taskPassword,'-alias','vibe','-keyalg','RSA','-keysize','3072','-validity','10000','-dname','CN=Vibe, O=Vibe, C=IN')
}
$taskApk="$taskBuild\Vibe.apk"
Run-Tool "$taskTools\apksigner.bat" @('sign','--ks',$taskKey,'--ks-key-alias','vibe','--ks-pass',"file:$taskPassword",'--out',$taskApk,"$taskBuild\aligned.apk")
Run-Tool "$taskTools\apksigner.bat" @('verify','--verbose','--print-certs',$taskApk)
Run-Tool "$taskTools\zipalign.exe" @('-c','-P','16','4',$taskApk)
Run-Tool "$taskTools\aapt.exe" @('dump','badging',$taskApk)
$taskHash=(Get-FileHash $taskApk -Algorithm SHA256).Hash.ToLowerInvariant()
Set-Content "$taskBuild\SHA256SUMS.txt" "$taskHash  Vibe.apk" -Encoding ascii
Write-Output "Signed APK: $taskApk"
