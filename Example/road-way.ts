import { Color, GeoJsonDataSource, Viewer } from 'cesium';
import { BMRoadWay, BMRoadWayStyle } from '../Src/main';
import { GUI } from 'dat.gui';

let _data_source: GeoJsonDataSource;
let _style_$1: BMRoadWayStyle;
let _style_$2: BMRoadWayStyle;
let _color: Color;
const _loadTestData = async () => {
	_data_source = await GeoJsonDataSource.load('../File/Model/way.geojson');
	_style_$1 = BMRoadWayStyle.through;
	_style_$2 = BMRoadWayStyle.twinkle;
	_color = new Color(0, 1, 0, 1);
};

export const example = async (viewer: Viewer, gui: GUI) => {
	await _loadTestData();
	const obj = new BMRoadWay(viewer, _data_source, _style_$1, { width: 3, speed: 3, color: _color });
	const options = {
		power: false,
		style: BMRoadWayStyle.through,
		color: _color.toCssColorString(),
	};

	const folder = gui.addFolder('道路线条');
	folder
		.add(options, 'power')
		.name('是否开启')
		.onChange(v => {
			v ? obj.enable() : obj.disable();
		});
	folder
		.add(options, 'style', {
			穿梭: BMRoadWayStyle.through,
			闪烁: BMRoadWayStyle.twinkle,
		})
		.name('线条风格')
		.onChange(v => {
			obj.style = Number(v);
		});
	folder
		.addColor(options, 'color')
		.name('闪烁线条的颜色')
		.onChange(v => {
			obj.color = Color.fromCssColorString(v);
		});
};

// // 初始化道路线段
// export const init = (
// 	viewer: Viewer,
// 	position: GeoJsonDataSource,
// 	style?: BMRoadWayStyle,
// 	options?: { width?: number; speed?: number }
// ) => {
// 	return new BMRoadWay(viewer, position, style, options);
// };

// // 关闭道路线段
// export const disable = (object: BMRoadWay) => {
// 	object.disable();
// };

// // 开启道路线段
// export const enable = (object: BMRoadWay) => {
// 	object.enable();
// };

// // 设置道路线段样式
// export const setStyle = (object: BMRoadWay, style: BMRoadWayStyle) => {
// 	object.style = style;
// };

// // 设置道路线段变化速度
// export const setSpeed = (object: BMRoadWay, speed: number) => {
// 	object.speed = speed;
// };

// // 设置道路线段线段宽度
// export const setWidth = (object: BMRoadWay, width: number) => {
// 	object.width = width;
// };
