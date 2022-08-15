import { Event, JulianDate, Property } from "cesium"

declare class Spriteline1MaterialProperty {
    constructor(duration: number, image: string);
    _definitionChanged: Event
    duration: number
    image: string
    _time: number
    isConstant: boolean
    definitionChanged: Event
    getType: (time: JulianDate) => string
    getValue: (time: JulianDate, result?: any) => any
    equals: (other?: Property | undefined) => boolean
}
export default Spriteline1MaterialProperty;