import { Viewer } from 'cesium';
import { GUI } from 'dat.gui';
import { BMSkyBox } from '../Src/main';

export const example = (viewer: Viewer, gui: GUI) => {
	const obj = new BMSkyBox(viewer);
	const options = {
		power: false,
	};

	const folder = gui.addFolder('近地天空盒');
	folder
		.add(options, 'power')
		.name('是否开启')
		.onChange(v => {
			v ? obj.enable() : obj.disable();
		});
};

// // 初始化天空盒
// export const init = (
// 	viewer: Viewer,
// 	textures?: {
// 		negative_x: string;
// 		positive_x: string;
// 		negative_y: string;
// 		positive_y: string;
// 		negative_z: string;
// 		positive_z: string;
// 	}
// ) => {
// 	return new BMSkyBox(viewer, textures);
// };

// // 关闭天空盒
// export const disable = (object: BMSkyBox) => {
// 	object.disable();
// };

// // 开启天空盒
// export const enable = (object: BMSkyBox) => {
// 	object.enable();
// };
