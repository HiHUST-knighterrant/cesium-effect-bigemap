import { Viewer } from 'cesium';
import { GUI } from 'dat.gui';
import { BMTemperatrue } from '../Src/main';

let _dataset_$1: { lat: number; lng: number; value: number }[];
let _dataset_$2: { lat: number; lng: number; value: number }[];
const _loadTestData = () => {
	const _center_$1 = [121.58, 38.91];
	//生成测试数据 [{lat:30,lng:104,value:500},{lat:30,lng:104,value:500}]
	_dataset_$1 = [];
	for (let i = 0; i < 100; i++) {
		_dataset_$1.push({
			lng: _center_$1[0] + window.Math.random() * 0.1 - 0.05,
			lat: _center_$1[1] + window.Math.random() * 0.1 - 0.05,
			value: window.Math.random() * 100,
		});
	}

	const _center_$2 = [121.48, 38.81];
	//生成测试数据 [{lat:30,lng:104,value:500},{lat:30,lng:104,value:500}]
	_dataset_$2 = [];
	for (let i = 0; i < 100; i++) {
		_dataset_$2.push({
			lng: _center_$2[0] + window.Math.random() * 0.1 - 0.05,
			lat: _center_$2[1] + window.Math.random() * 0.1 - 0.05,
			value: window.Math.random() * 100,
		});
	}
};

export const example = (viewer: Viewer, gui: GUI) => {
	_loadTestData();
	const obj = new BMTemperatrue(viewer, _dataset_$1, { lon_flag: 'lng', lat_flag: 'lat', value_flag: 'value' });

	const options = {
		power: false,
		dataset: '_dataset_$1',
	};
	const folder = gui.addFolder('等值面');
	folder
		.add(options, 'power')
		.name('是否开启')
		.onChange(v => {
			v ? obj.enable() : obj.disable();
		});
	folder
		.add(options, 'dataset', { 数据源1: '_dataset_$1', 数据源2: '_dataset_$2' })
		.name('数据源')
		.onChange(v => {
			obj.dataset = { _dataset_$1: _dataset_$1, _dataset_$2: _dataset_$2 }[v];
		});
};

// // 初始化等值面
// export const init = (
// 	viewer: Viewer,
// 	dataset: { [index: string]: any }[],
// 	format: { lon_flag: string; lat_flag: string; value_flag: string },
// 	levels?: number[],
// 	colors?: Color[],
// 	conversion?: (level: number) => number
// ) => {
// 	return new BMTemperatrue(viewer, dataset, format, levels, colors, conversion);
// };

// // 关闭等值面
// export const disable = (object: BMTemperatrue) => {
// 	object.disable();
// };

// // 开启等值面
// export const enable = (object: BMTemperatrue) => {
// 	object.enable();
// };

// // 设置等值面数据源
// export const setDataset = (object: BMTemperatrue, dataset: { [index: string]: any }[]) => {
// 	object.dataset = dataset;
// };

// // 设置等值面数据源字段格式
// export const setFormat = (
// 	object: BMTemperatrue,
// 	format: { lon_flag: string; lat_flag: string; value_flag: string }
// ) => {
// 	object.format = format;
// };

// // 设置等值面阶级数值
// export const setLevels = (object: BMTemperatrue, levels: number[]) => {
// 	object.levels = levels;
// };

// // 设置等值面阶级数值对应的颜色
// export const setColors = (object: BMTemperatrue, colors: Color[]) => {
// 	object.colors = colors;
// };

// // 设置等值面数据源的数值转换到阶级数值的方法
// export const setConversion = (object: BMTemperatrue, conversion: (level: number) => number) => {
// 	object.conversion = conversion;
// };
