## Videojs MediaTailor SGAI Integration 
Video.js plugin to easily integrate AWS MediaTailor's Server Guided Ad Integration (SGAI). <br/> <br/>


## What does this plugin do?



* Based on the tracking url response , it places yellow markers on the seekbar indicating start of the ad pod.

* Shows the ad-counter with remaining timer on the top left of the video.

* Advetisement Beaconing of selective events based on tracking url response. <br>
Supported Beacon Events : ['_breakStart_', '_breakEnd_', '_firstQuartile_', '_thirdQuartile_', '_midpoint_', '_impression_', '_complete_']

* Seeks back to the recent ad-pod if user attempts to skip.

* Disables seekbar and prevent user to skip when current advertisement is playing.





## 👉🏻 Options

| Option  | Type     | Required | Description                                                                                                                                                                              |
| ------- | -------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **trackingUrl**  | `String` | ✅ Yes    | AWS Media Tailor Tracking URL |
| **adEventCallback** | `Function` | ❌ No | Triggers when an advertisement beacon is fired|
| **skipAds** | `Boolean` | ❌ No | Allows to skip advetisement  | 
| **disableBeacon** | `Boolean` | ❌ No | Disables advertisement beacons | 
