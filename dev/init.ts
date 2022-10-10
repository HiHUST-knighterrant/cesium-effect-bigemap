declare global {
	interface Window {
		CESIUM_BASE_URL: string;
	}
}
window.CESIUM_BASE_URL = '../node_modules/cesium/Source/';
// window.CESIUM_BASE_URL = 'http://localhost:3000/dist/cesium/Source/';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import { CesiumWidget, Ion } from 'cesium';

Ion.defaultAccessToken =
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlN2MzMWE5ZC0wYzkyLTQ3ODMtYmJlYy1iN2QxMWI4NjU3ODUiLCJpZCI6OTMzMjYsImlhdCI6MTY1MjI1MzYyN30.irrMfifWXXSjF_wHoeyjgkmjDHZ4LBnFL4hIZf-HSGg';

const _init = () => {
	const div = document.createElement('div');
	div.setAttribute('id', '_');
	new CesiumWidget(div);
};

_init();
