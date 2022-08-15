import * as Cesium from "cesium";
const viewer = new Cesium.Viewer("canvas");
viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(121.5837, 38.8953, 10000),
    orientation: {
        heading: 0,
        pitch: Cesium.Math.toRadians(-70.5 || -Cesium.Math.PI_OVER_FOUR),
        roll: Cesium.Math.toRadians(360 || 0)
    },
    duration: 3,
});




viewer.scene.globe.depthTestAgainstTerrain = true;
viewer.scene.debugShowFramesPerSecond = true;
viewer.cesiumWidget.creditContainer.style.display = "none";
Cesium.ExperimentalFeatures.enableModelExperimental = true;


// 将经纬度高度 转换未世界坐标
let transformCartesian3Pos = function (__positions) {
    let realPos = []
    for (let i = 0, ii = __positions.length; i < ii; i += 3) {
        let position = Cesium.Cartesian3.fromDegrees(
            __positions[i],
            __positions[i + 1],
            __positions[i + 2]
        )
        realPos.push(position.x, position.y, position.z)
    }
    return realPos
}


const geometrys = [];

const realPos = transformCartesian3Pos([
    121.5857, 38.8953, -1000.,
    121.5857, 38.8953, 1000.,

    121.5613, 38.8954, -1000.,
    121.5613, 38.8954, 1000.,

    121.5630, 38.9122, -1000.,
    121.5630, 38.9122, 1000.,

    121.5845, 38.9120, -1000.,
    121.5845, 38.9120, 1000.,


    121.5857, 38.8953, 1000.,

    121.5613, 38.8954, 1000.,

    121.5630, 38.9122, 1000.,

    121.5845, 38.9120, 1000.,

]).flat();

const colors = [
    1., 1., 0., 1.,
    1., 1., 0., 1.,
    1., 1., 0., 1.,
    1., 1., 0., 1.,
    1., 1., 0., 1.,
    1., 1., 0., 1.,
    1., 1., 0., 1.,
    1., 1., 0., 1.,
    1., 1., 0., 1.,
    1., 1., 0., 1.,
    1., 1., 0., 1.,
    1., 1., 0., 1.,
];

const color = [
    1., 1., 0.,
    1., 1., 0.,
    1., 1., 0.,
    1., 1., 0.,
    1., 1., 0.,
    1., 1., 0.,
    1., 1., 0.,
    1., 1., 0.,
    0., 1., 0.,
    0., 1., 0.,
    0., 1., 0.,
    0., 1., 0.,
];

const indices = [
    0, 2, 4,
    0, 4, 6,

    0, 1, 3,
    0, 3, 2,

    0, 6, 7,
    0, 7, 1,

    6, 4, 5,
    6, 5, 7,

    4, 2, 3,
    4, 3, 5,

    8, 11, 10,
    8, 10, 9,
];

var attributes = new Cesium.GeometryAttributes({
    position: new Cesium.GeometryAttribute({
        componentDatatype: Cesium.ComponentDatatype.DOUBLE,
        componentsPerAttribute: 3,
        values: new Float64Array(realPos),
    }),
    color: new Cesium.GeometryAttribute({
        componentDatatype: Cesium.ComponentDatatype.FLOAT,
        componentsPerAttribute: 3,
        values: new Float32Array(color),
    }),
});

//包围球
var boundingSphere = Cesium.BoundingSphere.fromVertices(
    realPos,
    new Cesium.Cartesian3(0.0, 0.0, 0.0),
    3
);


// 计算顶点法向量
var geometry = new Cesium.Geometry({
    attributes: attributes,
    indices: indices,
    primitiveType: Cesium.PrimitiveType.TRIANGLES,
    boundingSphere: boundingSphere,
});

geometry = Cesium.GeometryPipeline.computeNormal(geometry);

geometrys.push(
    new Cesium.GeometryInstance({
        geometry: geometry
    })
);


let createGeometry = (position) => {
    const box = Cesium.BoxGeometry.fromDimensions({
        vertexFormat: Cesium.VertexFormat.ALL,
        dimensions: new Cesium.Cartesian3(400000.0, 400000.0, 400000.0),
        attributes: {
            normal: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.AQUA)
        }
    });

    let geometry_instance = new Cesium.GeometryInstance({
        geometry: box,
        modelMatrix: Cesium.Matrix4.multiplyByTranslation(
            Cesium.Transforms.eastNorthUpToFixedFrame(position),
            new Cesium.Cartesian3(0.0, 0.0, 0.),
            new Cesium.Matrix4()
        ),
        attributes: {
            normal: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.AQUA)
        }
    })

    geometrys.push(
        geometry_instance
    );
}


let material_appearance = new Cesium.PerInstanceColorAppearance({
    closed: true,
    translucent: false,
    flat: true,
    vertexShaderSource: `
        attribute vec3 position3DHigh;
attribute vec3 position3DLow;
attribute vec3 color;
// attribute vec2 st;
// attribute vec3 normal;
attribute float batchId;


// varying vec3 v_positionEC;
// varying vec3 v_normalEC;
// varying vec2 v_st;
varying vec3 v_normal;

void main()
{
    vec4 p = czm_computePosition();
    
    v_normal = (normalize(color) + 1.)/2.;
    // v_normal = color;
    // v_positionEC = (czm_modelViewRelativeToEye * p).xyz;      // position in eye coordinates
    // v_normalEC = czm_normal * normal;                         // normal in eye coordinates

    // v_st = st;

    gl_Position = czm_modelViewProjectionRelativeToEye * p;
}
        `,
    fragmentShaderSource: `
        // varying vec3 v_positionEC;
        // varying vec3 v_normalEC;
        // varying vec2 v_st;
        varying vec3 v_normal;

void main()
{
        if (dot(vec3(0.0, 1.0, 0.0), vec3(v_normal)) > 0.95) {
            gl_FragColor = vec4(1.,0.,0.,1.);
        } else {
            gl_FragColor = vec4(1.,1.,0.,1.);
        }

//     vec3 positionToEyeEC = -v_positionEC;

//     vec3 normalEC = normalize(v_normalEC);
// #ifdef FACE_FORWARD
//     normalEC = faceforward(normalEC, vec3(0.0, 0.0, 1.0), -normalEC);
// #endif

//     czm_materialInput materialInput;
//     materialInput.normalEC = normalEC;
//     materialInput.positionToEyeEC = positionToEyeEC;
//     materialInput.st = v_st;
//     czm_material material = czm_getMaterial(materialInput);

// #ifdef FLAT
//     gl_FragColor = vec4(material.diffuse + material.emission, material.alpha);
// #else
//     gl_FragColor = czm_phong(normalize(positionToEyeEC), material, czm_lightDirectionEC);
// #endif
}
    `
});


viewer.scene.primitives.add(new Cesium.Primitive({
    translucent: false,
    geometryInstances: geometrys,
    appearance: material_appearance,
    asynchronous: false,
}));
