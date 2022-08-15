import { Color, Event, JulianDate, Property } from "cesium"

type options = {
    color: Color,
    speed: number
}
declare class lineFlickerMaterialProperty {
    constructor(options: options);
    _definitionChanged: Event
    _color: Color | undefined
    _speed: number | undefined
    color: Color
    speed: number
    isConstant: boolean
    definitionChanged: Event
    getType: (time: JulianDate) => string
    getValue: (time: JulianDate, result?: any) => any
    equals: (other?: Property | undefined) => boolean
}
export default lineFlickerMaterialProperty;