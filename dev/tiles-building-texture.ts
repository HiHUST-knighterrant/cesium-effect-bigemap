import './init';
import {
	Cartesian4,
	Cesium3DTileset,
	Color,
	CustomShader,
	LightingModel,
	TextureUniform,
	UniformType,
	VaryingType,
	Viewer,
} from 'cesium';

export enum Style {
	None,
	Flood,
	Night,
}

export class TilesBuildingTexture {
	private readonly _viewer: Viewer;
	tileset!: Cesium3DTileset;
	private _tileset: Cesium3DTileset;
	style!: Style;
	private _style: Style;
	color!: Color;
	private _color: Color;

	private readonly _updateTileset = (reload: boolean) => {
		if (!this._tileset || !(this._style in Style)) return;
		switch (this._style) {
			case Style.Flood:
				this._tileset.customShader = this._createBuildingShaderFlood();
				break;
			case Style.Night:
				this._tileset.customShader = this._createBuildingShaderNight();
				break;
			case Style.None:
				this._tileset.customShader = undefined;
				break;
		}
		reload && this._viewer.scene.primitives.add(this._tileset);
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
					this._updateTileset(false);
				},
			},

			color: {
				get: () => {
					return this._color;
				},
				set: (color: Color) => {
					if (!color || this._color === color) return;
					this._color = color;
					this.style === Style.Flood &&
						this._tileset.customShader?.setUniform(
							'u_color',
							new Cartesian4(
								...(this._color
									? this._color.toBytes().map(v => Color.byteToFloat(v))
									: Color.fromRandom()
											.withAlpha(1)
											.toBytes()
											.map(v => Color.byteToFloat(v)))
							)
						);
				},
			},

			tileset: {
				get: () => {
					return this._tileset;
				},
				set: (tileset: Cesium3DTileset) => {
					if (!tileset || this._tileset === tileset) return;
					const reload = this._tileset && this._viewer.scene.primitives.remove(this._tileset);
					this._tileset = tileset;
					this._updateTileset(reload);
				},
			},
		});
	};

	constructor(viewer: Viewer, tileset: Cesium3DTileset, style = Style.Flood, color?: Color) {
		this._viewer = viewer;
		this._style = style;
		this._tileset = tileset;
		color && (this._color = color);

		this._updateTileset(false);
		this._bindProperty();
	}

	readonly enable = () => {
		const _destroy_primitives = this._viewer.scene.primitives.destroyPrimitives;
		this._viewer.scene.primitives.destroyPrimitives = false;
		this._viewer.scene.primitives.remove(this._tileset);
		this._viewer.scene.primitives.destroyPrimitives = _destroy_primitives;

		this._viewer.scene.primitives.add(this._tileset);
	};

	readonly disable = () => {
		const _destroy_primitives = this._viewer.scene.primitives.destroyPrimitives;
		this._viewer.scene.primitives.destroyPrimitives = false;
		this._viewer.scene.primitives.remove(this._tileset);
		this._viewer.scene.primitives.destroyPrimitives = _destroy_primitives;
	};

	private readonly _createBuildingShaderFlood = () => {
		return new CustomShader({
			lightingModel: LightingModel.UNLIT,
			uniforms: {
				u_color: {
					value: new Cartesian4(
						...(this._color
							? this._color.toBytes().map(v => Color.byteToFloat(v))
							: Color.fromRandom()
									.withAlpha(1)
									.toBytes()
									.map(v => Color.byteToFloat(v)))
					),
					type: UniformType.VEC4,
				},
			},

			fragmentShaderText: `
			void fragmentMain(FragmentInput fsInput, inout czm_modelMaterial material) {
				float _baseHeight = 0.0; 
				float _heightRange = 60.0;
				float _glowRange = 20.0;
			    float vtxf_height = fsInput.attributes.positionMC.y-_baseHeight;
			    float vtxf_a11 = fract(czm_frameNumber / 120.0) * 3.14159265 * 2.0;
			    float vtxf_a12 = vtxf_height / _heightRange + sin(vtxf_a11) * 0.1;
				material.diffuse = u_color.rgb;
			    material.diffuse*= vtxf_a12;

			    float vtxf_a13 = fract(czm_frameNumber / 360.0);
			    vtxf_a13 = abs(vtxf_a13 - 0.5) * 2.0;

			    float vtxf_h = clamp(vtxf_height / _glowRange, 0.0, 1.0);
			    float vtxf_diff = step(0.005, abs(vtxf_h - vtxf_a13));
			    material.diffuse += material.diffuse * (1.0 - vtxf_diff);
			}	 	
			`,
		});
	};

	private readonly _createBuildingShaderNight = () => {
		return new CustomShader({
			lightingModel: LightingModel.UNLIT,
			varyings: {
				v_normalMC: VaryingType.VEC3,
			},
			uniforms: {
				u_texture: {
					value: new TextureUniform({
						url: '../File/Texture/wall.png',
					}),
					type: UniformType.SAMPLER_2D,
				},
			},
			vertexShaderText: /* glsl */ `
void vertexMain(VertexInput vsInput, inout czm_modelVertexOutput vsOutput) {
  v_normalMC = vsInput.attributes.normalMC;
}`,
			fragmentShaderText: /* glsl */ `
void fragmentMain(FragmentInput fsInput, inout czm_modelMaterial material) {
  vec3 positionMC = fsInput.attributes.positionMC;
  float width = 50.0;
  float height = 5.0;
  if (dot(vec3(0.0, 1.0, 0.0), v_normalMC) > 0.95) {
    material.diffuse = vec3(0.079, 0.107, 0.111);
  } else {
    float textureX = 0.0;
    float dotXAxis = dot(vec3(1.0, 0.0, 0.0), v_normalMC);
    if (dotXAxis > 0.52 || dotXAxis < -0.52) {
        textureX = mod(positionMC.x, width) / width;
    } else {
        textureX = mod(positionMC.z, width) / width;
    }
    float textureY = mod(positionMC.y, height) / height;
    vec3 rgb = texture2D(u_texture, vec2(textureX, textureY)).rgb;

    material.diffuse = rgb;
  }
}`,
		});
	};
}
