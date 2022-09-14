import { Color, Viewer } from 'cesium';
import { GUI } from 'dat.gui';
import { BMSpaceLine, WGS84_LON_LAT } from '../Src/main';
let _center_$1: WGS84_LON_LAT;
let _center_$2: WGS84_LON_LAT;
let _color: Color;

const _loadTestData = () => {
	_center_$1 = [121.5856611728515, 38.9129980676015];
	_center_$2 = [121.4856611728515, 38.8129980676015];
	_color = new Color(0, 1, 0, 1);
};

export const example = (viewer: Viewer, gui: GUI) => {
	_loadTestData();
	const obj = new BMSpaceLine(viewer, _center_$1);
	obj.color = _color;
	const options = {
		power: false,
		center: '_center_$1',
		color: _color.toCssColorString(),
	};

	const folder = gui.addFolder('空间流动线');
	folder
		.add(options, 'power')
		.name('是否开启')
		.onChange(v => {
			v ? obj.enable() : obj.disable();
		});
	folder
		.add(options, 'center', {
			中心点1: '_center_$1',
			中心点2: '_center_$2',
		})
		.name('中心点')
		.onChange(v => {
			obj.center = { _center_$1: _center_$1, _center_$2: _center_$2 }[v];
		});
	folder
		.addColor(options, 'color')
		.name('线条颜色')
		.onChange(v => {
			obj.color = Color.fromCssColorString(v);
		});
};

// // 初始化空间线段
// export const init = (viewer: Viewer, center: WGS84_LON_LAT, quantity?: number, range?: number, color?: Color) => {
// 	return new BMSpaceLine(viewer, center, quantity, range, color);
// };

// // 关闭空间线段
// export const disable = (object: BMSpaceLine) => {
// 	object.disable();
// };

// // 开启空间线段
// export const enable = (object: BMSpaceLine) => {
// 	object.enable();
// };

// // 设置中心位置的经纬度
// export const setCenter = (object: BMSpaceLine, center: WGS84_LON_LAT) => {
// 	object.center = center;
// };

// // 设置线段颜色
// export const setColor = (object: BMSpaceLine, color: Color) => {
// 	object.color = color;
// };

// // 设置线段数量
// export const setQuantity = (object: BMSpaceLine, quantity: number) => {
// 	object.quantity = quantity;
// };

// // 设置生成空间线段的范围圆的半径
// export const setRange = (object: BMSpaceLine, range: number) => {
// 	object.range = range;
// };
