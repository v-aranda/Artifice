#define AppName "Artifice"
#define AppVersion GetEnv('ARTIFICE_VERSION')
#define AppPublisher "Artifice Team"
#define AppExeName "artifice.exe"

[Setup]
AppId={{CBE9D91E-CC7F-4C93-96C7-D4B7C4581482}
AppName={#AppName}
AppVersion={#AppVersion}
AppPublisher={#AppPublisher}
DefaultDirName={localappdata}\Programs\Artifice
DefaultGroupName={#AppName}
DisableProgramGroupPage=yes
OutputDir=..\release
OutputBaseFilename=Artifice-Setup-x64
Compression=lzma
SolidCompression=yes
PrivilegesRequired=lowest
ChangesEnvironment=yes
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible
UninstallDisplayIcon={app}\{#AppExeName}

[Files]
Source: "..\release\artifice.exe"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{autoprograms}\Artifice"; Filename: "{app}\{#AppExeName}"

[Registry]
Root: HKCU; Subkey: "Environment"; ValueType: expandsz; ValueName: "Path"; ValueData: "{olddata};{app}"; Check: NeedsPathEntry

[Code]
function NeedsPathEntry(): Boolean;
var
  ExistingPath: String;
begin
  if RegQueryStringValue(HKCU, 'Environment', 'Path', ExistingPath) then
    Result := Pos(ExpandConstant('{app}'), ExistingPath) = 0
  else
    Result := True;
end;
