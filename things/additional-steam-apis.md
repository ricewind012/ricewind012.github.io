# Additional APIs

The "websocket open/closed" console message(s) on app startup is from the Clientdll/SteamUI WebSockets that are used for some APIs much like SteamClient, except done through protobuf services. God knows why it's done like that.

You can replace the existing connections (see webpack module 12251) with your own like this to, then, manipulate it into logging which WebSocket is responsible for what service (there will be errors about "multiple attempts", that means it works):

```ts
import { findModuleExport } from "@decky/ui";

const mod = findModuleExport((e) => e.GetMaximumMsgSizeBytes);
await mod.Init();
await mod.MakeReady();
// -> {result: 1, message: "ready"}
```

They follow the same structure, and are simple objects, so they are easy to find as webpack modules:

```ts
import { findModuleExport } from "@decky/ui";

const BluetoothManagerService = findModuleExport(
	(e) => e.GetAdapterDetailsHandler,
);
```

All return a `Promise<CBaseProtoBufMsg<T>>` (see the type [here](https://github.com/SteamDeckHomebrew/decky-frontend-lib/blob/bfbc84d39ba4aef2e2beba329a60041d5ff5ddb6/src/globals/shared/interfaces.ts#L46-L53)):

```ts
import { EResult } from "@decky/ui";

const msg = await BluetoothManagerService.GetState();
const result = msg.GetEResult();
if (result !== EResult.OK) {
	console.error("got eresult %o from protobuf service", EResult[result]);
	return;
}

console.log(msg.Body().toObject());
// -> {is_service_available: false, adapters: Array(0), devices: Array(0)}
```

Expected return values should already be covered by https://github.com/SteamTracking/Protobufs in the `webui/service_*.proto` files, what you will be looking for are the `*_Response` messages. I could not type any of them, since most of them are for the Steam Deck, but here is the list of all _exported_ services:

AccountPrivacy:

- GetCookiePreferences

Authentication:

- BeginAuthSessionViaCredentials
- BeginAuthSessionViaQR
- EnumerateTokens
- GenerateAccessTokenForApp
- GetAuthSessionInfo
- GetAuthSessionRiskInfo
- GetAuthSessionsForAccount
- GetPasswordRSAPublicKey
- NotifyRiskQuizResults
- PollAuthSessionStatus
- RevokeRefreshToken
- RevokeToken
- UpdateAuthSessionWithMobileConfirmation
- UpdateAuthSessionWithSteamGuardCode

BluetoothManager:

- CancelPair
- Connect
- Disconnect
- Forget
- GetAdapterDetails
- GetDeviceDetails
- GetState
- NotifyStateChanged
- Pair
- RegisterForNotifyStateChanged
- SendMsgCancelPair
- SendMsgConnect
- SendMsgDisconnect
- SendMsgForget
- SendMsgGetAdapterDetails
- SendMsgGetDeviceDetails
- SendMsgGetState
- SendMsgNotifyStateChanged
- SendMsgPair
- SendMsgSetDiscovering
- SendMsgSetLoginAdvertising
- SendMsgSetTrusted
- SendMsgSetWakeAllowed
- SetDiscovering
- SetLoginAdvertising
- SetTrusted
- SetWakeAllowed

ClientMetrics:

- ClientAppInterfaceStatsReport
- ClientBootstrapReport
- ClientCloudAppSyncStats
- ClientContentValidationReport
- ClientDownloadRatesReport
- ClientDownloadResponseCodeCounts
- ClientIPv6ConnectivityReport
- ReportAccessibilitySettings
- ReportClientArgs
- ReportClientError
- ReportClipRange
- ReportClipShare
- ReportEndGameRecording
- ReportGamePerformance
- ReportLinuxStats
- ReportReactUsage
- SteamPipeWorkStatsReport

GameRecording:

- CleanupBackgroundRecordings
- DeleteClip
- DeletePerGameSettings
- ExportClip
- ExportClipPreview
- GetAndTrimPostGameHighlights
- GetAppsWithBackgroundVideo
- GetAvailableDiskSpace
- GetBackgroundRecordingFileSize
- GetClips
- GetEnoughDiskSpace
- GetPerGameSettings
- GetPlatformCapabilities
- GetState
- GetTags
- GetThumbnails
- GetTimelinesForApp
- GetTimelinesForClip
- GetTotalDiskSpaceUsage
- ManuallyDeleteRecordingsForApps
- NotifyClipCreated
- NotifyClipDeleted
- NotifyExportProgress
- NotifyLowDiskSpace
- NotifyOpenOverlayToGamePhase
- NotifyOpenOverlayToTimelineEvent
- NotifyPhaseListChanged
- NotifyPostGameHighlightsChanged
- NotifyRecordingSessionChanged
- NotifyStateChanged
- NotifyTimelineChanged
- NotifyTimelineEntryChanged
- NotifyTimelineEntryRemoved
- NotifyUploadProgress
- QueryPhases
- RegisterForNotifyClipCreated
- RegisterForNotifyClipDeleted
- RegisterForNotifyExportProgress
- RegisterForNotifyLowDiskSpace
- RegisterForNotifyOpenOverlayToGamePhase
- RegisterForNotifyOpenOverlayToTimelineEvent
- RegisterForNotifyPhaseListChanged
- RegisterForNotifyPostGameHighlightsChanged
- RegisterForNotifyRecordingSessionChanged
- RegisterForNotifyStateChanged
- RegisterForNotifyTimelineChanged
- RegisterForNotifyTimelineEntryChanged
- RegisterForNotifyTimelineEntryRemoved
- RegisterForNotifyUploadProgress
- SaveClip
- SendMsgCleanupBackgroundRecordings
- SendMsgDeleteClip
- SendMsgDeletePerGameSettings
- SendMsgExportClip
- SendMsgExportClipPreview
- SendMsgGetAndTrimPostGameHighlights
- SendMsgGetAppsWithBackgroundVideo
- SendMsgGetAvailableDiskSpace
- SendMsgGetBackgroundRecordingFileSize
- SendMsgGetClips
- SendMsgGetEnoughDiskSpace
- SendMsgGetPerGameSettings
- SendMsgGetPlatformCapabilities
- SendMsgGetState
- SendMsgGetTags
- SendMsgGetThumbnails
- SendMsgGetTimelinesForApp
- SendMsgGetTimelinesForClip
- SendMsgGetTotalDiskSpaceUsage
- SendMsgManuallyDeleteRecordingsForApps
- SendMsgNotifyClipCreated
- SendMsgNotifyClipDeleted
- SendMsgNotifyExportProgress
- SendMsgNotifyLowDiskSpace
- SendMsgNotifyOpenOverlayToGamePhase
- SendMsgNotifyOpenOverlayToTimelineEvent
- SendMsgNotifyPhaseListChanged
- SendMsgNotifyPostGameHighlightsChanged
- SendMsgNotifyRecordingSessionChanged
- SendMsgNotifyStateChanged
- SendMsgNotifyTimelineChanged
- SendMsgNotifyTimelineEntryChanged
- SendMsgNotifyTimelineEntryRemoved
- SendMsgNotifyUploadProgress
- SendMsgQueryPhases
- SendMsgSaveClip
- SendMsgSetPerGameSettings
- SendMsgStartRecording
- SendMsgStopRecording
- SendMsgSwitchBackgroundRecordingGame
- SendMsgTakeScreenshot
- SendMsgUploadClipToSteam
- SendMsgUserAddTimelineEntry
- SendMsgUserRemoveTimelineEntry
- SendMsgUserUpdateTimelineEntry
- SendMsgZipClip
- SetPerGameSettings
- StartRecording
- StopRecording
- SwitchBackgroundRecordingGame
- TakeScreenshot
- UploadClipToSteam
- UserAddTimelineEntry
- UserRemoveTimelineEntry
- UserUpdateTimelineEntry
- ZipClip

Gamescope:

- GetState
- NotifyStateChanged
- ReArmMuraCalibration
- RegisterForNotifyStateChanged
- SendMsgGetState
- SendMsgNotifyStateChanged
- SendMsgReArmMuraCalibration
- SendMsgSetBlurParams
- SendMsgSetDisplayPowerState
- SetBlurParams
- SetDisplayPowerState

HardwareUpdate:

- CheckForUpdates
- EnumerateDevices
- GetState
- NotifyStateChanged
- NotifyUpdateProgress
- NotifyUpdateStateChanged
- PrepForUpdate
- RegisterForNotifyStateChanged
- RegisterForNotifyUpdateProgress
- RegisterForNotifyUpdateStateChanged
- SendMsgCheckForUpdates
- SendMsgEnumerateDevices
- SendMsgGetState
- SendMsgNotifyStateChanged
- SendMsgNotifyUpdateProgress
- SendMsgNotifyUpdateStateChanged
- SendMsgPrepForUpdate
- SendMsgUpdate
- Update

LEDManager:

- GetState
- NotifyStateChanged
- RegisterForNotifyStateChanged
- SendMsgGetState
- SendMsgNotifyStateChanged
- SendMsgSetBrightness
- SendMsgSetColor
- SendMsgSetEffect
- SendMsgSetEnabled
- SendMsgSetManagerMode
- SendMsgSetSpeed
- SendMsgSetStartupBrightness
- SetBrightness
- SetColor
- SetEffect
- SetEnabled
- SetManagerMode
- SetSpeed
- SetStartupBrightness

SleepManager:

- GetState
- NotifyRequestSuspend
- NotifyResumeFromSuspend
- NotifyShowPowerMenu
- NotifyStateChanged
- RegisterForNotifyRequestSuspend
- RegisterForNotifyResumeFromSuspend
- RegisterForNotifyShowPowerMenu
- RegisterForNotifyStateChanged
- RequestSleep
- SendMsgGetState
- SendMsgNotifyRequestSuspend
- SendMsgNotifyResumeFromSuspend
- SendMsgNotifyShowPowerMenu
- SendMsgNotifyStateChanged
- SendMsgRequestSleep
- SendMsgSwitchToPowerState
- SwitchToPowerState

SteamEngine:

- GetGameIDForPID
- GetTextFilterDictionary
- NotifyTextFilterDictionaryChanged
- RegisterForNotifyTextFilterDictionaryChanged
- RegisterForSetOverlayEscapeKeyHandling
- RegisterForUpdateTextFilterDictionary
- SearchAppDataCacheByStoreKeywords
- SendMsgGetGameIDForPID
- SendMsgGetTextFilterDictionary
- SendMsgNotifyTextFilterDictionaryChanged
- SendMsgSearchAppDataCacheByStoreKeywords
- SendMsgSetOverlayEscapeKeyHandling
- SendMsgUpdateTextFilterDictionary
- SetOverlayEscapeKeyHandling
- UpdateTextFilterDictionary

SteamInputManager:

- CancelGyroSoftwareCalibration
- EnableDockedInput
- EnableQosStatus
- EndControllerStateFlow
- ForgetDonglePairingBond
- ForgetTritonPairingBond
- GetControllerAccessibilityStrings
- GetControllerList
- GetControllerName
- GetDongles
- GetTritonPairingInfo
- NotifyAxesStateChanged
- NotifyButtonStateChanged
- NotifyControllerBatteryState
- NotifyControllerDisconnected
- NotifyControllerListChanged
- NotifyControllerPairingChanged
- NotifyControllerPowerMenu
- NotifyFirstSteamControllerConnection
- NotifyGyroAccelerometerStateChanged
- NotifyGyroCalibrationStateChanged
- NotifyGyroQuaternionStateChanged
- NotifyGyroSpeedStateChanged
- NotifySteamDonglesChanged
- NotifyTritonQos
- NotifyTritonUndocked
- NotifyUnpairedTritonDocked
- NotifyUnpairedTritonPluggedIn
- PairDongleTritonConnected
- RegisterForNotifyAxesStateChanged
- RegisterForNotifyButtonStateChanged
- RegisterForNotifyControllerBatteryState
- RegisterForNotifyControllerDisconnected
- RegisterForNotifyControllerListChanged
- RegisterForNotifyControllerPairingChanged
- RegisterForNotifyControllerPowerMenu
- RegisterForNotifyFirstSteamControllerConnection
- RegisterForNotifyGyroAccelerometerStateChanged
- RegisterForNotifyGyroCalibrationStateChanged
- RegisterForNotifyGyroQuaternionStateChanged
- RegisterForNotifyGyroSpeedStateChanged
- RegisterForNotifySteamDonglesChanged
- RegisterForNotifyTritonQos
- RegisterForNotifyTritonUndocked
- RegisterForNotifyUnpairedTritonDocked
- RegisterForNotifyUnpairedTritonPluggedIn
- SendMsgCancelGyroSoftwareCalibration
- SendMsgEnableDockedInput
- SendMsgEnableQosStatus
- SendMsgEndControllerStateFlow
- SendMsgForgetDonglePairingBond
- SendMsgForgetTritonPairingBond
- SendMsgGetControllerAccessibilityStrings
- SendMsgGetControllerList
- SendMsgGetControllerName
- SendMsgGetDongles
- SendMsgGetTritonPairingInfo
- SendMsgNotifyAxesStateChanged
- SendMsgNotifyButtonStateChanged
- SendMsgNotifyControllerBatteryState
- SendMsgNotifyControllerDisconnected
- SendMsgNotifyControllerListChanged
- SendMsgNotifyControllerPairingChanged
- SendMsgNotifyControllerPowerMenu
- SendMsgNotifyFirstSteamControllerConnection
- SendMsgNotifyGyroAccelerometerStateChanged
- SendMsgNotifyGyroCalibrationStateChanged
- SendMsgNotifyGyroQuaternionStateChanged
- SendMsgNotifyGyroSpeedStateChanged
- SendMsgNotifySteamDonglesChanged
- SendMsgNotifyTritonQos
- SendMsgNotifyTritonUndocked
- SendMsgNotifyUnpairedTritonDocked
- SendMsgNotifyUnpairedTritonPluggedIn
- SendMsgPairDongleTritonConnected
- SendMsgShouldTritonPairInOobe
- SendMsgStartControllerStateFlow
- SendMsgStartGyroSoftwareCalibration
- SendMsgWaitInitialControllerStateEnumerated
- ShouldTritonPairInOobe
- StartControllerStateFlow
- StartGyroSoftwareCalibration
- WaitInitialControllerStateEnumerated

SteamOSManager:

- ApplyMandatoryUpdate
- FactoryReset
- GetState
- GetSteamVRPaths
- GetUserHasPassword
- NotifyStateChanged
- OptOutOfSideloadedClient
- PrepareFactoryImageTest
- RefreshScreenReaderAutoLocale
- RegisterForNotifyStateChanged
- SendMsgApplyMandatoryUpdate
- SendMsgFactoryReset
- SendMsgGetState
- SendMsgGetSteamVRPaths
- SendMsgGetUserHasPassword
- SendMsgNotifyStateChanged
- SendMsgOptOutOfSideloadedClient
- SendMsgPrepareFactoryImageTest
- SendMsgRefreshScreenReaderAutoLocale
- SendMsgSetDefaultDesktopSession
- SendMsgSetSteamVRPath
- SendMsgSetUserPassword
- SendMsgSwitchToDesktop
- SetDefaultDesktopSession
- SetSteamVRPath
- SetUserPassword
- SwitchToDesktop

SteamOSSLS:

- GetState
- NotifyStateChanged
- RegisterForNotifyStateChanged
- SendMsgGetState
- SendMsgNotifyStateChanged
- SendMsgSetEnabled
- SendMsgSetPluginEnabled
- SetEnabled
- SetPluginEnabled

SystemManager:

- Hibernate
- SendMsgHibernate
- SendMsgWriteFile
- WriteFile
