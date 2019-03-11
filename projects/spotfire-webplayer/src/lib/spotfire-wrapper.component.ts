import { Component, ViewEncapsulation } from '@angular/core';
import { SpotfireWebplayerComponent } from '../public_api';

@Component({
    templateUrl: 'spotfire-webplayer.component.html',
    styleUrls: ['./my-theme.scss', './spotfire-webplayer.component.scss']
})

export class SpotfireWrapperComponent extends SpotfireWebplayerComponent { }
