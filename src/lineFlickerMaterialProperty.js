import { Color, defined, Event, Material, createPropertyDescriptor, Property } from "cesium";

class LineFlickerMaterialProperty {
    constructor(options) {
        this._definitionChanged = new Event();
        this._color = undefined;
        this._speed = undefined;
        this.color = options.color;
        this.speed = options.speed;
    };

    get isConstant() {
        return false;
    }

    get definitionChanged() {
        return this._definitionChanged;
    }

    getType(time) {
        return Material.LineFlickerMaterialType;
    }

    getValue(time, result) {
        if (!defined(result)) {
            result = {};
        }

        result.color = Property.getValueOrDefault(this._color, time, Color.RED, result.color);
        result.speed = Property.getValueOrDefault(this._speed, time, 5.0, result.speed);
        return result
    }

    equals(other) {
        return (this === other ||
            (other instanceof LineFlickerMaterialProperty &&
                Property.equals(this._color, other._color) &&
                Property.equals(this._speed, other._speed))
        )
    }
}

Object.defineProperties(LineFlickerMaterialProperty.prototype, {
    color: createPropertyDescriptor('color'),
    speed: createPropertyDescriptor('speed'),
})

Material.LineFlickerMaterialProperty = LineFlickerMaterialProperty;
Material.LineFlickerMaterialType = 'LineFlickerMaterialType';
Material.LineFlickerMaterialSource =
    `
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
`;

Material._materialCache.addMaterial(Material.LineFlickerMaterialType, {
    fabric: {
        type: Material.LineFlickerMaterialType,
        uniforms: {
            color: new Color(1.0, 0.0, 0.0, 1.0),
            speed: 5.0,
        },
        source: Material.LineFlickerMaterialSource
    },
    translucent: true
})
export default LineFlickerMaterialProperty;