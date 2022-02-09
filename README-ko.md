# OpenCore Updater
쉽게 OpenCore 업데이트하기.

[English](./README.md) | 한국어(Korean)

## 설치
이 앱은 macOS만 지원합니다. 

[릴리즈 페이지](https://github.com/mswgen/oc-updater/releases)에서 최신 버전의 DMG를 다운로드하세요.

DMG를 마운트하고 OpenCore Updater를 응용 프로그램(/Applications)에 설치하세요.

처음 실행할 때 앱을 실행할 수 없다는 창이 뜹니다. 앱이 서명되지 않았기 때문에 창이 뜹니다.

취소를 누르고 Finder를 연 다음 응용 프로그램(/Applications)로 이동하세요.

OpenCore Updater를 우클릭하고 "열기"를 선택하세요. macOS가 개발자를 확인할 수 없다는 창이 뜹니다. 열기를 누르면 앱이 열립니다. 2번째 실행부터는 Launchpad에서 일반적인 방법으로 실행할 수 있지만, 앱을 업데이트할 때는 이 작업을 다시 해야 합니다.

## 사용 방법

앱이 열리면 `시작하기`를 누르세요. EFI 디렉토리 선택 창이 뜹니다.

EFI 디렉토리(보통 /Volumes/EFI/EFI)를 선택하세요. 바로 아래에 BOOT와 OC 폴더가 있어야 합니다.

OpenCore 버전이 감지되었다면, 사용중인 OpenCore 버전과 사용중인 kext 리스트가 뜹니다.

OpenCore 버전이 감지되지 않았다면, 사용중인 OpenCore 버전을 선택하라는 창이 뜹니다. 사용중인 버전을 선택하고 `버전 선택`을 누르세요.

구버전 OpenCore를 사용하고 있다면 앱이 OpenCore를 업데이트할지 묻습니다. `업데이트`를 누르면 OpenCore가 업데이트됩니다.

앱이 OpenCore, kext, 바이너리 데이터를 다운로드합니다. 시간이 오래 걸리거나 중간에 렉이 걸릴 수 있습니다. **앱을 닫지 마세요.**

다운로드가 끝나면 기존 EFI를 백업하고 파일을 바꿉니다.

파일 변경이 끝나면 config.plist를 수정합니다. 모두 완료되었다면, 완료되었다는 창이 뜹니다. 추가로 업데이트되지 않은 kext 목록, 백업 디렉토리 위치, OpenCore vault를 사용 중이었을 경우 관련 메세지가 뜹니다. 이제 컴퓨터를 재부팅하세요.

## 문제 해결

### 업데이트 완료 후 vault가 비활성화되었을 때

OpenCore Vault를 사용 중인 경우 앱이 OpenCore Vault를 업데이트할 수 없기 때문에 이 메세지가 뜹니다.

OpenCore Vault를 사용하려면 vault를 다시 만들고 config.plist에서 Vault를 활성화하세요.

### OpenCore 버전이 감지되지 않았을 때

OpenCore Updater는 OpenCore.efi의 SHA-256 해시와 앱 내부 해시 리스트를 비고해서 버전을 감지합니다. 해시가 앱의 내부 리스트에 없을 갱우, OpenCore Updater가 버전을 감지할 수 없습니다. 이 경우 버전을 수동으로 선택해주세요.

0.6.3 이전 버전은 지원되지 않습니다. 이 경우에는 먼저 0.6.3으로 업데이트 후 앱을 실행하세요.

DEBUG 빌드 또는 32비트 버전의 OpenCore도 지원되지 않습니다.

### 일부 kext가 업데이트되지 않았을 때

OpenCore Updater는 모든 kext를 업데이트하지 않고, 앱 내부 리스트에 있는 kext만 업데이트합니다. 이 리스트는 다음과 같습니다:

* VirtualSMC와 플러그인
* Lilu
* WhateverGreen
* AppleALC (AppleALCU 포함)
* VoodooPS2Controller
* VoodooI2C와 satelite kext
* ECEnabler
* BrightnessKeys
* IntelMausi
* RealtekRTL8111
* itlwm
* AirportItlwm
* IntelBluetoothFirmware
* IntelBluetoothInjector
* NVMeFix
* CpuTscSync
* CPUFriend
* AirportBrcmFixup
* BrcmPatchRAM kexts
  * BlueToolFixup
  * BrcmBluetoothInjector
  * BrcmBluetoothInjectorLegacy
  * BrcmFirmwareData
  * BrcmFirmwareRepo
  * BrcmNonPatchRAM
  * BrcmNonPatchRAM2
  * BrcmPatchRAM
  * BrcmPatchRAM2
  * BrcmPatchRAM3
* AtherosE2200Ethernet
* USBInjectAll
* XHCI-unsupported
* CtlnaAHCIPort
* SATA-unsupported
* AppleMCEReporterDisabler
* RealtekCardReader
* RealtekCardReaderFriend

나머지 kext는 업데이트되지 않습니다. 하지만 업데이트되지 않은 kext의 새 버전이 있을 경우 수동으로 업데이트해주세요.

### 앱 자동 업데이트

이 앱은 자동 업데이트를 지원합니다. 업데이트가 있을 경우 백그라운드에서 다운로드 후 알림이 뜨며, 앱을 닫으면 업데이트가 설치됩니다.

### 0.6.5에서 0.6.6으로 업데이트할 때 경고가 뜰 경우

0.6.6에서 /EFI/OC/Bootstrap/Bootstrap.efi는 config.plist-Misc-Boot-LauncherOption으로 변경되었습니다.

Bootstrap을 사용하지 않았다면 이 메세지는 뜨지 않습니다. 하지만 Bootstrap을 사용하면 이 메세지가 뜨게 됩니다.

이 경우, 아래 작업을 진행해주세요:

1. /EFI/OC/config.plist를 열고
1. Misc - Security - BootProtect를 None으로 설정하고
1. Misc - Security - AllowNvramReset을 True로 설정하고
1. 재부팅 후 OpenCore 부트 픽커에서 `Reset NVRAM`을 선택하세요.
1. 재부팅 후 바이오스 설정에서 `UEFI OS` (OpenCore의 BOOTx64.efi) 가 부팅 순서 1순위인지 확인하세요. 그렇지 않으면 `UEFI OS`를 1순위로 변경하세요.
1. 저장하고 macOS로 재부팅하세요
1. OpenCore Updater를 다시 실행하면 경고가 뜨지 않습니다.

### 업데이트 후 OpenCore Configurator, Xcode, PlistEdit Pro가 config.plist를 읽을 수 없을 경우

1.0.8에서 수정되었습니다. 구버전 OpenCore Updater를 사용 중이라면, 최신 버전으로 업데이트하세요.

## 빌드 방법

1. [Node.js](https://nodejs.org/en/download/)를 설치하세요. Version 16 (현재 LTS)가 권장됩니다.
1. 소스 코드를 클론하거나 다운로드하세요.
1. 터미널을 열고 `npm i -g yarn` 를 실행해서 yarn을 설치하세요.
1. `yarn`을 실행해서 의존성 패키지를 설치하세요.
1. 개발용으로 앱을 열려면 `yarn start`를 실행하세요.
1. `yarn build` 를 실행해서 앱을 빌드하세요. Mac이나 해킨토시가 필요합니다.
1. `out` 디렉토리에 DMG가 있어요. 이 앱은 Intel Mac(해킨토시 포함)과 Apple Sillicon Mac에서 실행할 수 있어요.

## 크레딧

[mswgen](https://github.com/mswgen): 개발자

[acidanthera](https://github.com/acidanthera): [OpenCore](https://github.com/acidanthera/OpenCorePkg) 와 여러 kext

[InsanelyMac](https://insanelymac.com): RealtekRTL8111 kext

[1Revenger1](https://github.com/1Revenger1): ECEnabler kext

[OpenIntelWireless](https://github.com/OpenIntelWireless): AirportItlwm, itlwm, IntelBluetoothFirmware kext

[VoodooI2C](https://github.com/VoodooI2C): VoodooI2C와 satelite kext

[Apple](https://apple.com): macOS

[junepark](https://x86.co.kr/@junepark): 테스트

[exacore39](https://x86.co.kr/@exacore39): 테스트

[JGP](https://x86.co.kr/@JGP): 테스트

[공득이](https://x86.co.kr/@공득이): 테스트

그리고 이 프로젝트의 기여자들

## 저작권

MIT 라이선스를 사용합니다. 자세한 사항은 [LICENSE](./LICENSE) 파일을 참고해주세요.

OpenCore와 OpenCore 로고는 Acidanthera의 상표입니다.

Apple과 macOS는 Apple Inc의 상표입니다. Apple은 이 프로젝트와 연괸되어있지 않습니다.

나머지 상표는 각 저작권자의 상표입니다.
