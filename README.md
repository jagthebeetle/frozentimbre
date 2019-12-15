# Overview

## 1. Fetching `Analysis` data for songs.
`main.js` uses Spotify's Audio Analysis API to download raw Analysis objects for the songs in the [_Frozen 2_](https://open.spotify.com/playlist/37i9dQZF1DXeapRjZhqZ07) playlist.

These consist of unaligned `segment` and `session` windows over each track, the former of which each contain a `timbre` vector and the latter of which each contain a musical `key` and `key_confidence`.

## 2. Aligning `segments` and `sessions`
`create.js` aligns windows and throws away unneeded fields, producing a csv of `(key_conf,t0,t1,...t11,duration)` tuples.

## 3. Prediction
`regression.py` uses a two-layer ReLU. This is a fairly simple model with just under 5000 parameters and trains in ~7m on a 2019 MBP.

## Results
Not great. MAE is 0.25 (on a value that falls in `[0, 1]`).
