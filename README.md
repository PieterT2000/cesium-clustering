# Cesium Entity Clusterer

### Install

`npm install cesium-clusterer` or `yarn add cesium-clusterer`

### Use

```ts
import * as Cesium from 'cesium'
import { CesiumCluster } from 'cesium-clusterer'

// ... Your viewer
const viewer = new Cesium.Viewer({...})
const clusterer = new CesiumCluster(viewer, {
    radius: 80, // In pixels
    minZoom: 0,
    maxZoom: 24
})
clusterer.load(...entities)
```
