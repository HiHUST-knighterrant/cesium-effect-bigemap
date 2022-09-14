import { Cartesian3, Cesium3DTileset, Color, Math, Matrix3, Matrix4, Transforms, Viewer } from 'cesium';
import { BMTilesBuildingTexture, BMTilesBuildingStyle } from '../Src/main';
import { GUI } from 'dat.gui';

// 这里不能直接用全局的方式创建 必须在example中调用loadTestData来创建tileset 不然CustomShader不能生效 可能是cesium内部处理有问题
let _tileset: Cesium3DTileset;
let _color: Color;
const _loadTestData = () => {
	_tileset = new Cesium3DTileset({
		url: '../File/Build/tileset.json', //数据地址
		maximumScreenSpaceError: 2, //最大的屏幕空间误差
		show: true,
	});
	_tileset.readyPromise.then(tileset => {
		_update3dtiles(tileset, {
			origin: tileset.boundingSphere.center,
			scalez: 15,
			translation: { x: 0, y: 0, z: -5 },
		});
	});
	_color = new Color(0, 1, 1, 1);
};

// 修改3dtiles位置
/*  var opt = {
   origin: "",
   rx: 30,
   ry: 30,
   rz: 30,
   scale: 2,
   scalex:1,
   scaley:1,
   scalez:1,
   translation: {x:0,y:0,z:0}
 } */
const _update3dtiles = (tileset: Cesium3DTileset, opt: any) => {
	if (!tileset) {
		alert('缺少模型！');
		return;
	}

	var origin = opt.origin;
	if (!origin) {
		alert('缺少坐标信息！');
		return;
	}

	let mtx = Transforms.eastNorthUpToFixedFrame(origin);

	opt.scalex = opt.scalex || 1;
	opt.scaley = opt.scaley || 1;
	opt.scalez = opt.scalez || 1;
	Matrix4.multiplyByScale(mtx, new Cartesian3(opt.scalex, opt.scaley, opt.scalez), mtx);

	opt.scale = opt.scale || 1; // 缩放系数 默认为1
	// 建立从局部到世界的坐标矩阵
	Matrix4.multiplyByUniformScale(mtx, opt.scale, mtx);

	// 表示绕x轴旋转
	if (opt.rx) {
		var mx = Matrix3.fromRotationX(Math.toRadians(opt.rx));
		var rotationX = Matrix4.fromRotationTranslation(mx);
		Matrix4.multiply(mtx, rotationX, mtx);
	}
	// 表示绕y轴旋转
	if (opt.ry) {
		var my = Matrix3.fromRotationY(Math.toRadians(opt.ry));
		var rotationY = Matrix4.fromRotationTranslation(my);
		Matrix4.multiply(mtx, rotationY, mtx);
	}
	// 表示绕z轴旋转
	if (opt.rz) {
		var mz = Matrix3.fromRotationZ(Math.toRadians(opt.rz));
		var rotationZ = Matrix4.fromRotationTranslation(mz);
		Matrix4.multiply(mtx, rotationZ, mtx);
	}

	if (opt.translation) {
		Matrix4.multiplyByTranslation(
			mtx,
			new Cartesian3(opt.translation.x, opt.translation.y, opt.translation.z),
			mtx
		);
	}
	tileset.root.transform = mtx;
};

export const example = (viewer: Viewer, gui: GUI) => {
	_loadTestData();
	const obj = new BMTilesBuildingTexture(viewer, _tileset, BMTilesBuildingStyle.Flood, _color);
	const options = {
		power: false,
		style: BMTilesBuildingStyle.Flood,
		color: _color.toCssColorString(),
	};

	const folder = gui.addFolder('3DTiles建筑贴图');
	folder
		.add(options, 'power')
		.name('是否开启')
		.onChange(v => {
			v ? obj.enable() : obj.disable();
		});
	folder
		.add(options, 'style', {
			无贴图: BMTilesBuildingStyle.None,
			泛光: BMTilesBuildingStyle.Flood,
			夜景: BMTilesBuildingStyle.Night,
		})
		.name('贴图风格')
		.onChange(v => {
			obj.style = Number(v);
		});
	folder
		.addColor(options, 'color')
		.name('泛光颜色')
		.onChange(v => {
			obj.color = Color.fromCssColorString(v);
		});
};

// // 初始化3dtiles建筑贴图
// export const init = (viewer: Viewer, tileset: Cesium3DTileset, style: BMTilesBuildingStyle) => {
// 	return new BMTilesBuildingTexture(viewer, tileset, style);
// };

// // 关闭3dtiles建筑贴图
// export const disable = (object: BMTilesBuildingTexture) => {
// 	object.disable();
// };

// // 开启3dtiles建筑贴图
// export const enable = (object: BMTilesBuildingTexture) => {
// 	object.enable();
// };

// // 设置3dtiles建筑贴图的tileset数据源
// export const setTileset = (object: BMTilesBuildingTexture, tileset: Cesium3DTileset) => {
// 	object.tileset = tileset;
// };

// // 设置3dtiles建筑贴图风格
// export const setStyle = (object: BMTilesBuildingTexture, style: BMTilesBuildingStyle) => {
// 	object.style = style;
// };
