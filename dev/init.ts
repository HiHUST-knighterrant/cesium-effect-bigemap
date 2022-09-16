declare global {
	interface Window {
		CESIUM_BASE_URL: string;
	}
}
window.CESIUM_BASE_URL = '../node_modules/cesium/Source/';
// window.CESIUM_BASE_URL = 'http://localhost:3000/dist/cesium/Source/';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import {
	CesiumWidget,
	createWorldTerrain,
	ExperimentalFeatures,
	Ion,
	PostProcessStageLibrary,
	UrlTemplateImageryProvider,
	Viewer,
} from 'cesium';

Ion.defaultAccessToken =
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlN2MzMWE5ZC0wYzkyLTQ3ODMtYmJlYy1iN2QxMWI4NjU3ODUiLCJpZCI6OTMzMjYsImlhdCI6MTY1MjI1MzYyN30.irrMfifWXXSjF_wHoeyjgkmjDHZ4LBnFL4hIZf-HSGg';

const _init = () => {
	const div = document.createElement('div');
	div.setAttribute('id', '_');
	// new CesiumWidget(div);
	const viewer = new Viewer(div, {
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
};

_init();
