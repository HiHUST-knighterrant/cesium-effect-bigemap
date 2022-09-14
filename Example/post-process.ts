import { Viewer } from 'cesium';
import { GUI } from 'dat.gui';
import { BMPostProcess } from '../Src/main';

export const example = (viewer: Viewer, gui: GUI) => {
	const options = {
		power: false,
	};

	const folder = gui.addFolder('夜视模式');
	folder
		.add(options, 'power')
		.name('是否开启')
		.onChange(v => {
			v ? BMPostProcess.enableNightVision(viewer) : BMPostProcess.disableNightVision(viewer);
		});
};

// export const enable = (viewer: Viewer) => {
// 	BMPostProcess.enableNightVision(viewer);
// };

// export const disable = (viewer: Viewer) => {
// 	BMPostProcess.disableNightVision(viewer);
// };
