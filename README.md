
## Videojs MediaTailor SGAI Integration 
Video.js plugin to easily integrate AWS MediaTailor's Server Side Ad Integration (SSAI). <br/> <br/>

For more information on mediatailor sgai integration refer to the aws official documentation : https://docs.aws.amazon.com/mediatailor/latest/ug/server-guided.html

<br>

<img width="799" height="449" alt="sgai" src="https://github.com/user-attachments/assets/42c6a920-88a1-47df-864f-c92fce9defc6" />


<br>

## 🗒️ What does this plugin do?

* Based on the tracking url response , it places yellow markers on the seekbar indicating start of the ad-pod.

* Shows the ad-counter with remaining timer for each individual ad on the top left of the video.

* Advetisement Beaconing of selective events based on tracking url response. <br>
Supported Beacon Events : ['_breakStart_', '_breakEnd_', '_firstQuartile_', '_thirdQuartile_', '_midpoint_', '_impression_', '_complete_']

* Seeks back to the recent ad-pod if user attempts to skip.

* Disables seekbar and prevent user to skip when current advertisement is playing.

<br>

## ⚙️ Installation and Usage.

```
npm i videojs-mediatailor-ssai
```
<br>

>💡 Note: Ensure that the manifest URL of the stitched ad asset is called, and the asset is loaded into the player before calling the `vjs_mediatailor_ssai` fn as shown below :
```
player.one('loadeddata',()= {
   player.vjs_mediatailor_ssai({
        trackingUrl: 'TRACKING URL from mediatailor'
    })
}
```

## 👉🏻 Options

| Option  | Type     | Required | Description                                                                                                                                                                              |
| ------- | -------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **trackingUrl**  | `String` | ✅ Yes    | AWS Media Tailor Tracking URL |
| **adEventCallback** | `Function` | ❌ No | Triggers when an advertisement beacon is fired|
| **skipAds** | `Boolean` | ❌ No | Allows to skip advetisement  | 
| **disableBeacon** | `Boolean` | ❌ No | Disables advertisement beacons | 



<br>


## 💬 Have a feature request / suggestion?
Feel free to raise the issue or reach out to me on damandeep.in@gmail.com 





