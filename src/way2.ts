import { Cartesian3, Color, ColorGeometryInstanceAttribute, ConstantProperty, CustomShader, GeoJsonDataSource, GeometryInstance, JulianDate, LightingModel, Material, PerInstanceColorAppearance, PolylineCollection, PolylineColorAppearance, PolylineGeometry, PolylineGraphics, PolylineMaterialAppearance, Primitive, VaryingType, Viewer } from "cesium";
import Spriteline1MaterialProperty from "./Spriteline1MaterialProperty";


export let line_material = new Material({
    strict: true,
    fabric: {
        type: "SpriteLine1",
        uniforms: {
            image: 'file/texture/spriteline1.png',
            time: 20,
        },
        source: `czm_material czm_getMaterial(czm_materialInput materialInput)
                        {
                        czm_material material = czm_getDefaultMaterial(materialInput);
                        vec2 st = materialInput.st;
                        vec4 colorImage = texture2D(image, vec2(fract(st.s - time), st.t));
                        material.alpha = colorImage.a;
                        material.diffuse = colorImage.rgb * 1.5 ;
                        return material;
                        }`
    }
})


let createWay = (viewer: Viewer) => {
    // 道路穿梭线
    GeoJsonDataSource.load("file/model/way.geojson").then(function (dataSource) {
        var instances: GeometryInstance[] = [];
        dataSource.entities.values.forEach(
            (entity) => {
                if (entity.polyline) {
                    instances.push(
                        new GeometryInstance({
                            geometry: new PolylineGeometry({
                                positions: entity.polyline?.positions?.getValue(new JulianDate()),
                                width: 1.7
                            })
                        })
                    );
                }
            }
        );

        viewer.scene.primitives.add(new Primitive({
            geometryInstances: instances, //合并
            //某些外观允许每个几何图形实例分别指定某个属性，例如：
            appearance: new PolylineMaterialAppearance({
                translucent: false,
                material: line_material
            })
        }));



        // viewer.dataSources.add(dataSource);
        // const entities = dataSource.entities.values;
        // for (let i = 0; i < entities.length; i++) {
        //     let entity = entities[i];
        //     (entity.polyline as PolylineGraphics).width = new ConstantProperty(1.7);
        //     (entity.polyline as PolylineGraphics).material = new Spriteline1MaterialProperty(1000, 'file/texture/spriteline1.png');

        // }
    });
}

export default createWay;