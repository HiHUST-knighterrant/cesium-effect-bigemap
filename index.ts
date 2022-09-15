declare global {
	interface Window {
		CESIUM_BASE_URL: string;
	}
}
window.CESIUM_BASE_URL = './node_modules/cesium/Source/';
// window.CESIUM_BASE_URL = 'http://localhost:3000/dist/cesium/Source/';
import 'cesium/Build/Cesium/Widgets/widgets.css';

import { example as exampleRoadWay } from './Example/road-way';
import { example as exampleElectricArc } from './Example/electric-arc';
import { example as examplePostProcess } from './Example/post-process';
import { example as exampleSkyBox } from './Example/sky-box';
import { example as exampleSpaceLine } from './Example/space-line';
import { example as exampleTemperatrue } from './Example/temperatrue';
import { example as exampleTilesBuildingTexture } from './Example/tiles-building-texture';
import { example as exampleClippingPlane } from './Example/clipping-plane';

import { GUI } from 'dat.gui';
const gui = new GUI();

import {
	CameraEventType,
	Cartesian3,
	createWorldTerrain,
	EventHelper,
	ExperimentalFeatures,
	Ion,
	Math,
	PostProcessStageLibrary,
	UrlTemplateImageryProvider,
	Viewer,
} from 'cesium';

Ion.defaultAccessToken =
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlN2MzMWE5ZC0wYzkyLTQ3ODMtYmJlYy1iN2QxMWI4NjU3ODUiLCJpZCI6OTMzMjYsImlhdCI6MTY1MjI1MzYyN30.irrMfifWXXSjF_wHoeyjgkmjDHZ4LBnFL4hIZf-HSGg';

const viewer = new Viewer('canvas', {
	terrainProvider: createWorldTerrain({ requestVertexNormals: true, requestWaterMask: true }),
	animation: false, //是否显示动画控件
	baseLayerPicker: false, //是否显示图层选择控件
	geocoder: false, //是否显示地名查找控件
	timeline: false, //是否显示时间线控件
	sceneModePicker: false, //是否显示投影方式控件
	navigationHelpButton: false, //是否显示帮助信息控件
	infoBox: false, //是否显示点击要素之后显示的信息
	homeButton: false,
	shouldAnimate: true,
	imageryProvider: new UrlTemplateImageryProvider({
		// url: "http://localhost:9001/bigemap.arcgis-satellite/tiles/{z}/{x}/{y}.jpg?access_token=pk.eyJ1IjoiY3VzXzI5NW1kMnA5IiwiYSI6Ijlsa3h2NGJ1aHAxOG5ieHlqemw5ZnM0MXciLCJ0IjoxfQ.qwuFOEMOF5pJaDeSifOVJcMdq5iQI3mZVn4INsJZBD8",
		url: 'https://gac-geo.googlecnapps.cn/maps/vt?lyrs=y&gl=cn&x={x}&y={y}&z={z}',
	}),
});

viewer.scene.globe.depthTestAgainstTerrain = true;
viewer.scene.debugShowFramesPerSecond = true;
(viewer.cesiumWidget.creditContainer as HTMLElement).style.display = 'none';
ExperimentalFeatures.enableModelExperimental = true;

if (!PostProcessStageLibrary.isSilhouetteSupported(viewer.scene)) {
	window.alert('This browser does not support the silhouette post process.');
}

// onload
viewer.scene.screenSpaceCameraController.rotateEventTypes = [CameraEventType.LEFT_DRAG];
viewer.scene.screenSpaceCameraController.tiltEventTypes = [CameraEventType.RIGHT_DRAG];
viewer.scene.screenSpaceCameraController.zoomEventTypes = [CameraEventType.WHEEL];

const helper = new EventHelper();
helper.add(viewer.scene.globe.tileLoadProgressEvent, e => {
	if (e == 0) {
		// 相机视角(平滑)移动到指定经纬度位置
		viewer.camera.flyTo({
			destination: Cartesian3.fromDegrees(121.58, 38.91, 20000), //经度、纬度、高度
			orientation: {
				heading: 0,
				pitch: Math.toRadians(-90 || -Math.PI_OVER_FOUR),
				roll: Math.toRadians(360 || 0),
			},
			duration: 3,
		});
		helper.removeAll();
	}
});

exampleRoadWay(viewer, gui);
exampleElectricArc(viewer, gui);
examplePostProcess(viewer, gui);
exampleSkyBox(viewer, gui);
exampleSpaceLine(viewer, gui);
exampleTemperatrue(viewer, gui);
exampleTilesBuildingTexture(viewer, gui);
exampleClippingPlane(viewer, gui);
