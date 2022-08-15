import { Color, defined, Event, Material, JulianDate, Property, MaterialProperty, createPropertyDescriptor } from "cesium";

declare module "cesium" {
    export interface Property {
        getValueOrDefault?: (property: any, time: any, valueDefault: any, result: any) => any;
    }

    export interface MaterialProperty {
        equalsInterface?: (left: any, right: any) => boolean;
        _definitionChanged?: Event;
        _color?: options["color"] | undefined;
        _speed?: options["speed"] | undefined;
        _percent?: options["percent"] | undefined;
        _gradient?: options["gradient"] | undefined;
        color?: options["color"];
        speed?: options["speed"];
        percent?: options["percent"];
        gradient?: options["gradient"];
    }

    export interface Material {
        LineFlowMaterialProperty: object;
        LineFlowMaterialType: string;
        LineFlowMaterialSource: string;
        _materialCache: {
            _materials: { [type: string]: any },
            addMaterial: (type: string, materialTemplate: { [index: string]: any }) => void,
            getMaterial: (type: string) => any
        };
    }

    export function createPropertyDescriptor(name: any, configurable?: any, createPropertyCallback?: any): any;
}

MaterialProperty.prototype.equalsInterface = (left: any, right: any) => {
    return left === right || (defined(left) && left.equals(right));
};

type options = {
    color: Color;
    speed: number;
    percent: number;
    gradient: number;
};

const _getExn = (param: any): any | never => {
    if (param === undefined || param === null) {
        throw new Error("参数类型为undefined或null");
    }
    return param;
};

/**
 * 这里不能写到LineFlowMAterialProperty Class中 渲染后的颜色不是预期的颜色
 */
declare interface LineFlowMaterialProperty {
    _definitionChanged: Event;
    _color: options["color"] | undefined;
    _speed: options["speed"] | undefined;
    _percent: options["percent"] | undefined;
    _gradient: options["gradient"] | undefined;
    color: options["color"];
    speed: options["speed"];
    percent: options["percent"];
    gradient: options["gradient"];
}

class LineFlowMaterialProperty {
    constructor(options: options) {
        this._definitionChanged = new Event();
        this._color = undefined;
        this._speed = undefined;
        this._percent = undefined;
        this._gradient = undefined;

        this.color = options.color;
        this.speed = options.speed;
        this.percent = options.percent;
        this.gradient = options.gradient;
    };

    get isConstant() {
        return false;
    }

    get definitionChanged() {
        return this._definitionChanged;
    }

    getType(time: JulianDate) {
        return (Material as any as Material).LineFlowMaterialType;

    }

    getValue(time: JulianDate, result: {
        color?: options["color"];
        speed?: options["speed"];
        percent?: options["percent"];
        gradient?: options["gradient"];
    }) {
        if (!defined(result)) {
            result = {};
        }

        result.color = _getExn((Property as any as Property).getValueOrDefault)(this._color, time, Color.RED, result.color);
        result.speed = _getExn((Property as any as Property).getValueOrDefault)(this._speed, time, 5.0, result.speed);
        result.percent = _getExn((Property as any as Property).getValueOrDefault)(this._percent, time, 0.1, result.percent);
        result.gradient = _getExn((Property as any as Property).getValueOrDefault)(this._gradient, time, 0.01, result.gradient);
        return result
    }

    equals(other?: LineFlowMaterialProperty): boolean {
        return (this === other ||
            (other instanceof LineFlowMaterialProperty &&
                _getExn(MaterialProperty.prototype.equalsInterface)(this._color, other._color) &&
                _getExn(MaterialProperty.prototype.equalsInterface)(this._speed, other._speed) &&
                _getExn(MaterialProperty.prototype.equalsInterface)(this._percent, other._percent) &&
                _getExn(MaterialProperty.prototype.equalsInterface)(this._gradient, other._gradient))
        )
    }
}

Object.defineProperties(LineFlowMaterialProperty.prototype, {
    color: createPropertyDescriptor('color'),
    speed: createPropertyDescriptor('speed'),
    percent: createPropertyDescriptor('percent'),
    gradient: createPropertyDescriptor('gradient'),
});

(Material as any as Material).LineFlowMaterialProperty = LineFlowMaterialProperty;
(Material as any as Material).LineFlowMaterialType = 'LineFlowMaterialType';
(Material as any as Material).LineFlowMaterialSource =
    `
    uniform vec4 color;
    uniform float speed;
    uniform float percent;
    uniform float gradient;
    
    czm_material czm_getMaterial(czm_materialInput materialInput){
      czm_material material = czm_getDefaultMaterial(materialInput);
      vec2 st = materialInput.st;
      float t =fract(czm_frameNumber * speed / 1000.0);
      t *= (1.0 + percent);
      float alpha = smoothstep(t- percent, t, st.s) * step(-t, -st.s);
      alpha += gradient;
      material.diffuse = color.rgb;
      material.alpha = alpha;
      return material;
    }
    `;

(Material as any as Material)._materialCache.addMaterial((Material as any as Material).LineFlowMaterialType, {
    fabric: {
        type: (Material as any as Material).LineFlowMaterialType,
        uniforms: {
            color: new Color(1.0, 0.0, 0.0, 1.0),
            speed: 10.0,
            percent: 0.1,
            gradient: 0.01
        },
        source: (Material as any as Material).LineFlowMaterialSource
    },
    translucent: true
})
export default LineFlowMaterialProperty;