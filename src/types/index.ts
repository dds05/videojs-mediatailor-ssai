import type Player from 'video.js/dist/types/player';
import type ControlBar from 'video.js/dist/types/control-bar/control-bar'

import type Component from 'video.js/dist/types/component'

interface AdsOptions extends Player {
    trackingUrl: string;
    disableBeacon?: boolean;
    skipAds?:boolean
    adEventCallback?: Function
}

type VideoJSPlayer = Player & Component & {
    removeChild: any;
    theme?:(options: AdsOptions)=>void;
    controlBar?: ControlBar & {
        removeChild: any
    }
};


export type { VideoJSPlayer, AdsOptions }