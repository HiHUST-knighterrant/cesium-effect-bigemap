import { Color, ConstantProperty, GeoJsonDataSource, GeometryInstance, JulianDate, Material, PolylineGeometry, PolylineGraphics, PolylineMaterialAppearance, Primitive, Viewer } from "cesium";
import LineFlickerMaterialProperty from "./lineFlickerMaterialProperty";



export let line_material = new Material({
    strict: true,
    fabric: {
        type: "lineFlicker",
        uniforms: {
            color:Color.RED,
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
`
    }
})


let createWay = (viewer: Viewer) => {
    // 道路闪烁线
    GeoJsonDataSource.load("file/model/way.geojson").then(function (dataSource) {
        var instances: GeometryInstance[] = [];
        dataSource.entities.values.forEach(
            (entity) => {
                if (entity.polyline) {
                    instances.push(
                        new GeometryInstance({
                            geometry: new PolylineGeometry({
                                positions: entity.polyline?.positions?.getValue(new JulianDate()),
                                width: 3.0
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

        // for (let i = 0; i < entities.length; i++) {
        //     let entity = entities[i];
        //     (entity.polyline as PolylineGraphics).width = new ConstantProperty(3.0);
        //     // 设置材质
        //     (entity.polyline as PolylineGraphics).material = new LineFlickerMaterialProperty({
        //         color: Color.YELLOW,
        //         // 设置随机变化速度
        //         speed: 20 * Math.random(),
        //     })
        // }
    });
}

export default createWay;