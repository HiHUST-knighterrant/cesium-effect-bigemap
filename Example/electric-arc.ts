import { Color, Viewer } from 'cesium';
import { GUI } from 'dat.gui';
import { BMArcMode, BMElectricArc, WGS84_POSITION } from '../Src/main';

let _position_$1: WGS84_POSITION<true, false>;
let _position_$2: WGS84_POSITION<true, false>;
let _color: Color;
const _loadTestData = () => {
	_position_$1 = [121.5856611728515, 38.9129980676015];
	_position_$2 = [121.4856611728515, 38.8129980676015];
	_color = new Color(0, 1, 0, 1);
};

export const example = (viewer: Viewer, gui: GUI) => {
	_loadTestData();
	const obj = new BMElectricArc(viewer, _position_$1, BMArcMode.Bothway, true, _color, 1000);
	const options = {
		power: false,
		position: '_position_$1',
		arc_mode: BMArcMode.Bothway,
		mask: true,
		color: _color.toCssColorString(),
		radius: 1000,
	};

	const folder = gui.addFolder('电弧特效');
	folder
		.add(options, 'power')
		.name('是否开启')
		.onChange(v => {
			v ? obj.enable() : obj.disable();
		});
	folder
		.add(options, 'position', { 位置1: '_position_$1', 位置2: '_position_$2' })
		.name('位置')
		.onChange(v => {
			obj.position = { _position_$1: _position_$1, _position_$2: _position_$2 }[v];
		});
	folder
		.add(options, 'arc_mode', { 上下循环: BMArcMode.Bothway, 从上至下: BMArcMode.Down, 从下至上: BMArcMode.Up })
		.name('电弧模式')
		.onChange(v => {
			obj.arc_mode = Number(v);
		});
	folder
		.add(options, 'mask')
		.name('是否有半球遮罩')
		.onChange(v => {
			obj.mask = v;
		});

	folder
		.addColor(options, 'color')
		.name('颜色')
		.onChange(v => {
			obj.color = Color.fromCssColorString(v);
		});

	folder
		.add(options, 'radius')
		.name('电弧半径')
		.min(1)
		.max(10000)
		.step(1)
		.onChange(v => {
			obj.radius = v;
		});
};

// // 初始化电弧
// export const init = (viewer: Viewer, position: WGS84_POSITION, arc_mode: BMArcMode, mask: boolean, color: Color) => {
// 	return new BMElectricArc(viewer, position, arc_mode, mask, color);
// };

// // 关闭电弧
// export const disable = (object: BMElectricArc) => {
// 	object.disable();
// };

// // 开启电弧
// export const enable = (object: BMElectricArc) => {
// 	object.enable();
// };

// // 设置电弧工作模式
// export const setArcMode = (object: BMElectricArc, arc_mode: BMArcMode) => {
// 	object.arc_mode = arc_mode;
// };

// // 设置电弧颜色
// export const setColor = (object: BMElectricArc, color: Color) => {
// 	object.color = color;
// };

// // 设置电弧是否有遮罩半球
// export const setMask = (object: BMElectricArc, mask: boolean) => {
// 	object.mask = mask;
// };

// // 设置电弧中心点的经纬度坐标
// export const setPosition = (object: BMElectricArc, position: WGS84_POSITION) => {
// 	object.position = position;
// };
