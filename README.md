# Overview

## 1. Fetching `Analysis` data for songs.
`main.js` uses Spotify's [Audio Analysis](https://developer.spotify.com/documentation/web-api/reference/tracks/get-audio-analysis/) API to download raw Analysis objects for the songs in the [_Frozen 2_](https://open.spotify.com/playlist/37i9dQZF1DXeapRjZhqZ07) playlist.

These consist of unaligned `segment` and `session` windows over each track, the former of which each contain a 12-component `timbre` vector and the latter of which each contain a musical `key` and `key_confidence`.

## 2. Aligning `segments` and `sessions`
`create.js` aligns windows and throws away unneeded fields, producing a csv of `(key_conf,t0,t1,...,t11,duration)` tuples.

## 3. Prediction
`regression.py` uses a two-layer ReLU. This is a fairly simple model with just under 5000 parameters and trains in ~7m on a 2019 MBP.

## Results

### Two-layer NN
Training stops working well after 50-60 epochs (compared to up to 1000 epochs), with ~21 MAE in key-confidence prediction.

### Weighted linear regression
Since segments are of differing durations, it seems reasonable to have the loss function incorporate the duration of a segment as a penalty-weighting during training. This adds a weight term to the loss function equal to the duration of the segment. This achieves a comparable MAE of ~22.5.
