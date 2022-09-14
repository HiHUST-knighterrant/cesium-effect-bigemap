import {
	Cartesian3,
	Color,
	GeometryInstance,
	Material,
	PolylineGeometry,
	PolylineMaterialAppearance,
	Primitive,
	Viewer,
} from 'cesium';

type LON = number;
type LAT = number;
type WGS84_LON_LAT = [LON, LAT];

// 中心点 数量 范围 颜色
export class SpaceLine {
	private _primitive: Primitive;
	private readonly _viewer: Viewer;
	center: WGS84_LON_LAT;
	private _center: WGS84_LON_LAT;
	quantity: number;
	private _quantity: number;
	range: number;
	private _range: number;
	color: Color;
	private _color: Color;

	private readonly _generateInstances = (center: WGS84_LON_LAT, num: number, radius: number) => {
		const positions: WGS84_LON_LAT[] = [];
		for (let i = 0; i < num; i++) {
			let r = Math.sqrt(Math.random()) * radius;
			let theta = Math.random() * 2 * Math.PI;
			let circle = [Math.cos(theta) * r, Math.sin(theta) * r];
			positions.push([center[0] + circle[0], center[1] + circle[1]]);
		}
		return positions.map(item => {
			return new GeometryInstance({
				geometry: new PolylineGeometry({
					positions: [
						Cartesian3.fromDegrees(item[0], item[1], 0),
						Cartesian3.fromDegrees(item[0], item[1], 5000 * Math.random()),
					],
				}),
			});
		});
	};

	private readonly _bindProperty = () => {
		Object.defineProperties(this, {
			center: {
				get: () => {
					return this._center;
				},
				set: (center: WGS84_LON_LAT) => {
					if (
						!(center instanceof Array) ||
						center.length !== 2 ||
						typeof center[0] !== 'number' ||
						typeof center[1] !== 'number' ||
						this._center === center
					)
						return;
					this._center = center;
					this._updatePrimitive();
				},
			},
			quantity: {
				get: () => {
					return this._quantity;
				},
				set: (quantity: number) => {
					if (quantity <= 0 || this._quantity === quantity) return;
					this._quantity = quantity;
					this._updatePrimitive();
				},
			},

			range: {
				get: () => {
					return this._range;
				},
				set: (range: number) => {
					if (range <= 0 || this._range === range) return;
					this._range = range;
					this._updatePrimitive();
				},
			},

			color: {
				get: () => {
					return this._color;
				},
				set: (color: Color) => {
					if (!color || this._color === color) return;
					this._color = color;
					this._primitive.appearance.material.uniforms.color = this._color;
				},
			},
		});
	};

	private readonly _updatePrimitive = () => {
		if (!this._center || !this._quantity || !this._range || !this._color) return;
		const reload = this._primitive && this._viewer.scene.primitives.remove(this._primitive);

		const instances = this._generateInstances(this._center, this._quantity, this._range);
		this._primitive = new Primitive({
			geometryInstances: instances, //合并
			//某些外观允许每个几何图形实例分别指定某个属性，例如：
			appearance: new PolylineMaterialAppearance({
				translucent: true,
				material: new Material({
					strict: true,
					fabric: {
						type: 'SpaceLine',
						uniforms: {
							color: this._color,
							speed: 5.0,
							percent: 0.1,
							gradient: 0.01,
						},
						source: `    
                        czm_material czm_getMaterial(czm_materialInput materialInput){
                        czm_material material = czm_getDefaultMaterial(materialInput);
                        vec2 st = materialInput.st;
                        float t =fract(czm_frameNumber *  speed / 1000.0);
                        t *= (1.0 + percent);
                        float alpha = smoothstep(t- percent, t, st.s) * step(-t, -st.s);
                        alpha += gradient;
                        material.diffuse = color.rgb;
                        material.alpha = alpha;
                        return material;
                        }`,
					},
				}),
			}),
		});

		reload && this._viewer.scene.primitives.add(this._primitive);
	};

	constructor(viewer: Viewer, center: WGS84_LON_LAT, quantity = 960, range = 0.1, color = new Color(0, 1, 0, 1)) {
		this._viewer = viewer;
		center && (this._center = center);
		quantity && (this._quantity = quantity);
		range && (this._range = range);
		color && (this._color = color);
		this._updatePrimitive();
		this._bindProperty();
	}

	readonly enable = () => {
		const _destroy_primitives = this._viewer.scene.primitives.destroyPrimitives;
		this._viewer.scene.primitives.destroyPrimitives = false;
		this._viewer.scene.primitives.remove(this._primitive);
		this._viewer.scene.primitives.destroyPrimitives = _destroy_primitives;

		this._viewer.scene.primitives.add(this._primitive);
	};

	readonly disable = () => {
		const _destroy_primitives = this._viewer.scene.primitives.destroyPrimitives;
		this._viewer.scene.primitives.destroyPrimitives = false;
		this._viewer.scene.primitives.remove(this._primitive);
		this._viewer.scene.primitives.destroyPrimitives = _destroy_primitives;
	};
}
