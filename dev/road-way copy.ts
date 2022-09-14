import {
	Color,
	GeoJsonDataSource,
	GeometryInstance,
	GroundPolylineGeometry,
	GroundPolylinePrimitive,
	JulianDate,
	Material,
	PolylineMaterialAppearance,
	Viewer,
} from 'cesium';

export enum Style {
	through,
	twinkle,
}

export class RoadWay {
	style: Style;
	private _style: Style;
	width: number;
	private _width: number;
	speed: number;
	private _speed: number;
	color: Color;
	private _color: Color;

	private readonly _viewer: Viewer;
	private readonly _primitive: GroundPolylinePrimitive;
	private _listener: ((...args: any[]) => void) | undefined;

	private readonly _createListener = () => {
		return () => {
			// 该函数每帧都会被调用所以这里的this._speed会是最新的值 所以this._speed不需要单独处理
			switch (this._style) {
				case Style.through:
					this._primitive.appearance.material.uniforms.time =
						0.222 /
						(((performance.now() - this._primitive.appearance.material.uniforms.time) %
							(5000 / this._speed)) /
							(5000 / this._speed));
					break;
				case Style.twinkle:
					if (this._primitive.appearance.material.uniforms.speed !== this._speed)
						this._primitive.appearance.material.uniforms.speed = this._speed;
					break;
			}
		};
	};

	private readonly _bindProperty = () => {
		Object.defineProperties(this, {
			style: {
				get: () => {
					return this._style;
				},
				set: (style: Style) => {
					if (typeof style !== 'number' || !(style in Style) || this._style === style) return;
					this._style = style;
					switch (style) {
						case Style.through:
							this._primitive.appearance.material = this._through_style;
							break;
						case Style.twinkle:
							this._color && (this._twinkle_style.uniforms.color = this._color);
							this._primitive.appearance.material = this._twinkle_style;
							break;
					}
				},
			},
			width: {
				get: () => {
					return this._width;
				},
				set: (width: number) => {
					if (width <= 0 || this._width === width) return;
					this._width = width;
					this._primitive &&
						(this._primitive.geometryInstances as GeometryInstance[]).forEach(
							v => ((v.geometry as unknown as GroundPolylineGeometry).width = width)
						);
				},
			},

			speed: {
				get: () => {
					return this._speed;
				},
				set: (speed: number) => {
					if (speed <= 0 || this._speed === speed) return;
					this._speed = speed;
				},
			},

			color: {
				get: () => {
					return this._color;
				},
				set: (color: Color) => {
					if (!color || this._color === color) return;
					this._color = color;
					this._style === Style.twinkle && (this._primitive.appearance.material.uniforms.color = this._color);
				},
			},
		});
	};

	constructor(
		viewer: Viewer,
		data_source: GeoJsonDataSource,
		style: Style = Style.through,
		options?: { width?: number; speed?: number; color?: Color }
	) {
		this._viewer = viewer;
		this._bindProperty();

		const instances: GeometryInstance[] = [];
		data_source.entities.values.forEach(entity => {
			entity.polyline &&
				instances.push(
					new GeometryInstance({
						geometry: new GroundPolylineGeometry({
							positions: entity.polyline?.positions?.getValue(new JulianDate()),
							width: this._width,
						}),
					})
				);
		});

		this._primitive = new GroundPolylinePrimitive({
			geometryInstances: instances, //合并
			//某些外观允许每个几何图形实例分别指定某个属性，例如：
			appearance: new PolylineMaterialAppearance({
				translucent: false,
				material: this._through_style,
			}),
		});

		this.style = style in Style ? style : Style.through;
		options && options.speed && (this.speed = options.speed);
		options && options.width && (this.width = options.width);
		options && options.color && (this.color = options.color);
	}

	readonly enable = () => {
		this._listener && this._viewer.scene.preUpdate.removeEventListener(this._listener);

		const _destroy_primitives = this._viewer.scene.primitives.destroyPrimitives;
		this._viewer.scene.primitives.destroyPrimitives = false;
		this._viewer.scene.primitives.remove(this._primitive);
		this._viewer.scene.primitives.destroyPrimitives = _destroy_primitives;

		this._listener = this._createListener();
		this._viewer.scene.primitives.add(this._primitive);
		this._viewer.scene.preUpdate.addEventListener(this._listener);
	};

	readonly disable = () => {
		this._listener && this._viewer.scene.preUpdate.removeEventListener(this._listener);
		const _destroy_primitives = this._viewer.scene.primitives.destroyPrimitives;
		this._viewer.scene.primitives.destroyPrimitives = false;
		this._viewer.scene.primitives.remove(this._primitive);
		this._viewer.scene.primitives.destroyPrimitives = _destroy_primitives;

		this._listener = undefined;
	};

	private readonly _through_style = new Material({
		strict: true,
		fabric: {
			type: 'through',
			uniforms: {
				image: '../File/Texture/spriteline1.png',
				time: 0,
			},
			source: `czm_material czm_getMaterial(czm_materialInput materialInput)
                        {
                        czm_material material = czm_getDefaultMaterial(materialInput);
                        vec2 st = materialInput.st;
                        vec4 colorImage = texture2D(image, vec2(fract(st.s - time), st.t));
                        material.alpha = colorImage.a;
                        material.diffuse = colorImage.rgb * 1.5 ;
                        return material;
                        }`,
		},
	});

	private readonly _twinkle_style = new Material({
		strict: true,
		fabric: {
			type: 'twinkle',
			uniforms: {
				color: Color.fromRandom().withAlpha(1),
				speed: 20 * Math.random(),
			},
			source: `
uniform vec4 color;
uniform float speed;
czm_material czm_getMaterial(czm_materialInput materialInput){
  czm_material material = czm_getDefaultMaterial(materialInput);
  float time = fract( czm_frameNumber  *  speed / 1000.0);
  float scalar = smoothstep(0.0,1.0,time);
  material.diffuse = color.rgb * scalar;
  material.alpha = color.a * scalar;
  return material;
}
`,
		},
	});
}
