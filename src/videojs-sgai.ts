import videojs from "video.js";
import { throttle , formatTime} from "./utils";
import { AdsOptions, VideoJSPlayer } from "../types";

(function (videojs) {
    const MediaTailorAdIntegration = async function (this: VideoJSPlayer, options:AdsOptions) {

        const player = this;
        const skipAds = options?.skipAds || false;
        const adEventCallback = options?.adEventCallback;
        const tracking_url = options?.trackingUrl;
        const disableBeacon = options?.disableBeacon || false;


        //Fetch Tracking Url
        const res = await fetch(tracking_url);
        const data = await res.json();

        //Retrieve Tracking Url Information
        let advertisementPodsData = data['avails']
        const progressControl = player.controlBar?.getChild('ProgressControl')
        const seekBarEl = progressControl?.getChild('SeekBar')?.el();


        // Marker Logic for seekbar
        advertisementPodsData.forEach(({ startTimeInSeconds, ads }:any) => {
            startTimeInSeconds = Math.floor(startTimeInSeconds);
            const duration = player.duration() ?? 0;
            if (startTimeInSeconds > duration) return;
            if (Array.isArray(ads) && ads?.length == 0) return;
            const leftPercent = (startTimeInSeconds / duration) * 100;
            const marker = document.createElement('div');
            marker.className = 'vjs-seekbar-marker';
            marker.style.left = `${leftPercent}%`;
            marker.style.position = 'absolute';
            marker.style.top = '0';
            marker.style.bottom = '0';
            marker.style.width = '2px';
            marker.style.backgroundColor = '#fecc09';
            marker.style.left = `${leftPercent}%`;
            marker.style.pointerEvents = 'none';
            seekBarEl?.appendChild(marker);
        });

        //Ad counter + timer logic
        const adPodMap = new Map();
        let lastTime:any = -1;
        player.on('timeupdate', throttle(() => {
            const currentTime:any = player.currentTime();

            if (currentTime === lastTime)
                return;

            lastTime = currentTime;
            let adFound = false;
            for (let i = 0; i < advertisementPodsData.length; i++) {
                const pod = advertisementPodsData[i]
                const { startTimeInSeconds, durationInSeconds, ads } = pod;
                const endTime = startTimeInSeconds + durationInSeconds;
                if (currentTime >= startTimeInSeconds - 1.2 && currentTime <= endTime + 1.2) {
                    if (currentTime >= startTimeInSeconds && currentTime <= endTime && Array.isArray(ads) && ads?.length > 0)
                        adFound = true;

                    if (currentTime > endTime)
                        adPodMap.set(startTimeInSeconds, true)

                    // disable seek only once when ad starts
                    if (progressControl && !skipAds)
                        progressControl.disable()

                    const relativeTime = currentTime - startTimeInSeconds;
                    let accumulatedTime = 0;

                    const currentAdIndex = ads.findIndex(ad => {
                        accumulatedTime += ad.durationInSeconds;
                        return relativeTime < accumulatedTime;
                    });

                    if (currentAdIndex !== -1) {
                        adContainer.style.display = 'block';
                        adCounter.textContent = `Ad ${currentAdIndex + 1} of ${ads.length}`;
                        const currentAd = ads[currentAdIndex];
                        const adStartTime = accumulatedTime - currentAd.durationInSeconds;
                        const adElapsed = relativeTime - adStartTime;
                        const remainingAdTime = Math.max(0, currentAd.durationInSeconds - adElapsed);
                        adTimer.textContent = `${formatTime(Math.round(remainingAdTime))} remaining`;
                    }

                    if (!disableBeacon) {
                        const trackEvents = ads?.flatMap((ad) => ad.trackingEvents.filter((event) => ['breakStart', 'breakEnd', 'firstQuartile', 'thirdQuartile', 'midpoint', 'impression', 'complete'].includes(event?.eventType))) || [];
                        triggerSSAIBeaconAtTime(currentTime, pod, i, trackEvents);
                    }
                    break;
                }
            }
            if (!adFound) {
                progressControl.enable();
                adContainer.style.display = 'none';
            }
        }, 1000));

        const adContainer = document.createElement('div');
        adContainer.className = 'ssai-ad-container'
        const adCounter = document.createElement('div');
        adCounter.className = 'ad-counter';
        const adTimer = document.createElement('div');
        adTimer.className = 'ad-timer';
        adContainer.append(adCounter);
        adContainer.append(adTimer);
        player.el().appendChild(adContainer);


        //Ad Beaconing
        const trackMap = new Map();
        function triggerAdBeacon(eventType:string, pod:Object, urls:Array<string>) {

            if (typeof adEventCallback == 'function') {
                adEventCallback({
                    pod,
                    eventType,
                    currentTime: Math.round(player.currentTime())
                })
            }

            console.warn(`%c SSAI BEACON `, 'background: #e25822; color: #fff', eventType, `Fired:${Math.round(player.currentTime())}`, 'AD_POD:', pod);
            urls?.forEach((url) => {
                fetch(url, {
                    mode: 'no-cors'
                }).catch((err) => {
                    console.warn('Beacon failed:', url, err);
                });
            });
        }

        function triggerSSAIBeaconAtTime(timestamp:any, pod:any, podIdx:number, beaconEvents:Array<any>) {
            if (player.seeking()) {
                return;
            }
            const { startTimeInSeconds, durationInSeconds } = pod;
            const currentTime = Math.floor(player.currentTime());
            const endTime = Math.floor(startTimeInSeconds + durationInSeconds);
            for (const event of beaconEvents) {
                const { eventType, beaconUrls, startTimeInSeconds: rawStartTime, startTime, durationInSeconds } = event;

                const startTimeInSeconds = rawStartTime || 0;
                const urls = beaconUrls;
                let mapKey = `${startTimeInSeconds}_${eventType}`;
                let podEventStatus = trackMap.get(`pod-${podIdx}`) || []

                console.log(podEventStatus);
                if (timestamp >= startTimeInSeconds && !podEventStatus.includes(mapKey)) {
                    podEventStatus.push(mapKey)
                    trackMap.set(`pod-${podIdx}`, podEventStatus);
                    try {
                        triggerAdBeacon(eventType, pod, urls);
                    } catch (e) {
                        console.error('Error when calling triggerAdBeacon:', e, eventType, pod);
                    }
                };
            }
        }

        // Prevent AD Skip
        function handlePreventSkip() {
            function stopDragging(event) {
                document.removeEventListener('pointerup', stopDragging);
                if (event.button !== 0) return;
                if (progressControl.enabled())
                    checkAndSeekToRecentAdPod();
            }
            progressControl.el().addEventListener('pointerdown', (event) => {
                if (event.button !== 0) return;
                document.addEventListener('pointerup', stopDragging);
            });

            function checkAndSeekToRecentAdPod() {
                const currentTime = player.currentTime();
                let seekToRecentAdPod = null;
                for (const pod of advertisementPodsData) {
                    const { startTimeInSeconds, durationInSeconds, ads } = pod;
                    const endTime = Math.floor(startTimeInSeconds + durationInSeconds);
                    if (Array.isArray(ads) && ads?.length > 0 && ((currentTime > endTime || currentTime > startTimeInSeconds) && !adPodMap.has(startTimeInSeconds)) || (currentTime >= startTimeInSeconds && currentTime <= endTime)) {
                        seekToRecentAdPod = startTimeInSeconds;
                        adPodMap.set(startTimeInSeconds, true);
                    }
                }
                if (seekToRecentAdPod !== null) {
                    setTimeout(() => {
                        player.currentTime(seekToRecentAdPod + 0.4);
                    }, 100);
                }
            }
        }
        if (!skipAds)
            handlePreventSkip();
    }

    videojs.registerPlugin('vjs_mediatailor_sgai', MediaTailorAdIntegration);
})(videojs);