import { Appearance, BoundingSphere, BoxGeometry, Cartesian3, Cartographic, Color, ComponentDatatype, EllipsoidGeometry, EllipsoidSurfaceAppearance, Geometry, GeometryAttribute, GeometryAttributes, GeometryInstance, GeometryPipeline, HeadingPitchRoll, Material, MaterialAppearance, Math, Matrix3, Matrix4, modelMatrix, PerInstanceColorAppearance, Primitive, PrimitiveType, Transforms, VertexFormat, vertexShaderText, Viewer } from "cesium";

export enum ArcMode {
    Bothway,
    Down,
    Up
}

const vertex = `attribute vec3 position3DHigh;
attribute vec3 position3DLow;
attribute vec3 normal;
attribute vec2 st;
attribute float batchId;

varying vec3 v_positionEC;
varying vec3 v_normalEC;
varying vec2 v_st;
varying vec3 v_normalMC;

void main()
{
    vec4 p = czm_computePosition();

    v_normalMC = normal;
    v_positionEC = (czm_modelViewRelativeToEye * p).xyz;      // position in eye coordinates
    v_normalEC = czm_normal * normal;                         // normal in eye coordinates
    v_st = st;

    gl_Position = czm_modelViewProjectionRelativeToEye * p;
}`;


const fragment = `
	uniform vec4 color;
	uniform float speed;
	uniform float arc_mode;
    uniform bool mask;
    varying vec3 v_normalMC;

    float random3_1(vec3 point) 
    {
        return fract(sin(dot(point, vec3(12.9898,78.233,45.5432)))*43758.5453123);
    }

    float thunder(vec2 uv, float time, float seed, float segments, float amplitude)
    {
        float h = uv.y;
        float s = uv.x*segments;
        float t = time*20.0;
        
        vec2 fst = floor(vec2(s,t));
        vec2 cst = ceil(vec2(s,t));
        
        float h11 = h + (random3_1(vec3(fst.x, fst.y, seed)) - 0.5) * amplitude;
        float h12 = h + (random3_1(vec3(cst.x, fst.y, seed)) - 0.5) * amplitude;
        float h21 = h + (random3_1(vec3(fst.x, cst.y, seed)) - 0.5) * amplitude;
        float h22 = h + (random3_1(vec3(cst.x, cst.y, seed)) - 0.5) * amplitude;
        
        float h1 = mix(h11, h12, fract(s));
        float h2 = mix(h21, h22, fract(s));
        float alpha = mix(h1, h2, fract(t));
        
        return 1.0 - abs(alpha - 0.5) / 0.5;
    }


	#define pi 3.1415926535
	#define PI2RAD 0.01745329252
	#define TWO_PI (2. * PI)
	
	float rands(float p){
	return fract(sin(p) * 10000.0);
	}
	
	float noise(vec2 p){
	float time = fract( czm_frameNumber * speed / 1000.0);
	float t = time / 20000.0;
	if(t > 1.0) t -= floor(t);
	return rands(p.x * 14. + p.y * sin(t) * 0.5);
	}
	
	vec2 sw(vec2 p){
	return vec2(floor(p.x), floor(p.y));
	}
	
	vec2 se(vec2 p){
	return vec2(ceil(p.x), floor(p.y));
	}
	
	vec2 nw(vec2 p){
	return vec2(floor(p.x), ceil(p.y));
	}
	
	vec2 ne(vec2 p){
	return vec2(ceil(p.x), ceil(p.y));
	}
	
	float smoothNoise(vec2 p){
	vec2 inter = smoothstep(0.0, 1.0, fract(p));
	float s = mix(noise(sw(p)), noise(se(p)), inter.x);
	float n = mix(noise(nw(p)), noise(ne(p)), inter.x);
	return mix(s, n, inter.y);
	}
	
	float fbm(vec2 p){
	float z = 2.0;
	float rz = 0.0;
	vec2 bp = p;
	for(float i = 1.0; i < 6.0; i++){
	    rz += abs((smoothNoise(p) - 0.5)* 2.0) / z;
	    z *= 2.0;
	    p *= 2.0;
	}
	return rz;
	}
	

	czm_material czm_getMaterial(czm_materialInput materialInput)
	{
	czm_material material = czm_getDefaultMaterial(materialInput);
	vec2 st = materialInput.st;


    if (st.t < 0.5) discard;

    if (mask) {
        float time = fract( czm_frameNumber * speed / 1000.0);
        vec2 uv = materialInput.st;
        vec2 st2 = materialInput.st;
        uv *= 4.;
        float rz = fbm(uv);
        uv /= exp(mod( time * 2.0, pi));
        rz *= pow(15., 0.9);
        vec4 temp = vec4(0);
        temp = mix( color / rz, vec4(color.rgb, 0.1), 0.2);
        if (st2.s < 0.05) {
            temp = mix(vec4(color.rgb, 0.1), temp, st2.s / 0.05);
        }
        if (st2.s > 0.95){
            temp = mix(temp, vec4(color.rgb, 0.1), (st2.s - 0.95) / 0.05);
        }
        material.diffuse = temp.rgb;
        material.alpha = temp.a * 2.0;
    }



        float time = czm_frameNumber * speed / 1000.0;
        float time_next = (czm_frameNumber + 1.) * speed /1000.0;

        if (arc_mode == 0.) {
            float i = smoothstep(-1.,1.,abs(cos(time)));
            st *= i;
        } else {
            float i = smoothstep(-1.,1.,cos(time));
            float i_next = smoothstep(-1.,1.,cos(time_next));
            float j = (i_next - i) / (time_next - time);

            if (arc_mode == 1.) {
                if (j>0.) {
                    st *= i;
                } else {
                    st *= 1.-i;
                }
            } else if (arc_mode == 2.) {
                if (j<0.) {
                    st *= i;
                } else {
                    st *= 1.-i;
                }
            }
        }


        float alpha = 0.0;
        for(int i = 0; i < 5; ++i)
        {
            float f = float(i) + 0.;
            float a = thunder(st, time/1.5, f, 10.0 * pow(1.25, f), 0.055 * pow(1.25, f));
            a = pow(a, f + 2.0); 
            alpha = max(alpha, a);
        }
        alpha = max((alpha-0.9)/0.1, 0.0);
        
        if (mask) {
            material.diffuse = mix(vec3(alpha,alpha,alpha) * color.rgb,material.diffuse,0.8);
            material.alpha += alpha;
        } else {
            material.diffuse = vec3(alpha,alpha,alpha) * color.rgb;
            material.alpha = alpha;
        }
        return material;

	}
	`;


const geometrys: GeometryInstance[] = [];


// 将经纬度高度 转换未世界坐标
let transformCartesian3Pos = function (__positions: number[]) {
    let realPos = []
    for (let i = 0, ii = __positions.length; i < ii; i += 3) {
        let position = Cartesian3.fromDegrees(
            __positions[i],
            __positions[i + 1],
            __positions[i + 2]
        )
        realPos.push(position.x, position.y, position.z)
    }
    return realPos
}


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

const indices = new Uint32Array(
    [
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
    ]
);

let createCube = () => {
    var attributes = new GeometryAttributes();
    attributes.position = new GeometryAttribute({
        componentDatatype: ComponentDatatype.DOUBLE,
        componentsPerAttribute: 3,
        values: new Float64Array(realPos),
    });
    attributes.color = new GeometryAttribute({
        componentDatatype: ComponentDatatype.FLOAT,
        componentsPerAttribute: 3,
        values: new Float32Array(color),
    });



    //包围球
    var boundingSphere = BoundingSphere.fromVertices(
        realPos,
        new Cartesian3(0.0, 0.0, 0.0),
        3
    );

    // 计算顶点法向量
    var geometry = new Geometry({
        attributes: attributes,
        indices: indices,
        primitiveType: PrimitiveType.TRIANGLES,
        boundingSphere: boundingSphere,
    });

    geometry = GeometryPipeline.computeNormal(geometry);

    return new GeometryInstance({
        geometry: geometry
    })

}










let createGeometry = (position: Cartesian3) => {
    position.y += 2000;
    const box = BoxGeometry.fromDimensions({
        vertexFormat: VertexFormat.ALL,
        dimensions: new Cartesian3(2000.0, 2000.0, 2000.0),
    });

    let modelMatrix = Transforms.eastNorthUpToFixedFrame(position);
    let hprRotation = Matrix3.fromHeadingPitchRoll(
        new HeadingPitchRoll(Math.toRadians(90), 0., 0.)// 中心点水平旋转90度
    );
    let hpr = Matrix4.fromRotationTranslation(
        hprRotation,
        new Cartesian3(0.0, 0.0, 0.0)// 不平移
    );
    Matrix4.multiply(modelMatrix, hpr, modelMatrix);

    let geometry_instance = new GeometryInstance({
        geometry: box,
        modelMatrix: modelMatrix
    })

    console.log(
        geometry_instance.geometry
    )


    geometrys.push(
        geometry_instance
    );
}

let create_appearance = (arc_mode: ArcMode, mask: boolean, color: Color) => {
    let box_material = new Material({
        strict: true,
        fabric: {
            uniforms: {
                // color: new Color(0.33, .44, 0.66, 1.),
                color: color,
                speed: 10.0,
                arc_mode: arc_mode,
                mask: mask
            },
            source: fragment
        }
    })

    let material_appearance = new MaterialAppearance({
        translucent: true,
        // closed: true,
        // faceForward:true,
        flat: true,
        material: box_material,
        vertexShaderSource: vertex,
        // fragmentShaderSource: fragment
    });
    return material_appearance;
}

let createEllipsoid = (position: Cartesian3) => {
    const ellipsoid = new EllipsoidGeometry({
        vertexFormat: VertexFormat.POSITION_AND_ST,
        radii: new Cartesian3(1000.0, 1000.0, 1000.0),
    });

    let modelMatrix = Transforms.eastNorthUpToFixedFrame(position);
    let hprRotation = Matrix3.fromHeadingPitchRoll(
        new HeadingPitchRoll(0., 0., 0.)
    );
    let hpr = Matrix4.fromRotationTranslation(
        hprRotation,
        new Cartesian3(0.0, 0.0, 0.0)// 不平移
    );
    Matrix4.multiply(modelMatrix, hpr, modelMatrix);

    return new GeometryInstance({
        geometry: ellipsoid,
        modelMatrix: modelMatrix
    });
}



let random = () => {
    return (window.Math.round(window.Math.random()) * 2 - 1) * ((window.Math.random() * 5 + 3) / 100)
}


export function createElectricArc(viewer: Viewer, position: Cartesian3, arc_mode: ArcMode, mask: boolean, color: Color) {
    // createGeometry(position);
    // let cube = createCube();
    // let ellopsoid1 = createEllipsoid(position);

    let posi1 = transformCartesian3Pos([
        121.5846 + random(),
        38.9120 + random(),
        0.
    ]);
    let posi2 = transformCartesian3Pos([
        121.5846 + random(),
        38.9120 + random(),
        0.
    ]);

    let ellopsoid1 = createEllipsoid(new Cartesian3(posi1[0], posi1[1], posi1[2]));
    let ellopsoid2 = createEllipsoid(new Cartesian3(posi2[0], posi2[1], posi2[2]));
    const geometrys:GeometryInstance[] = [];
    geometrys.push(ellopsoid1, ellopsoid2);

    viewer.scene.primitives.add(new Primitive({
        geometryInstances: geometrys, //合并
        //某些外观允许每个几何图形实例分别指定某个属性，例如：
        appearance: create_appearance(arc_mode, mask, color),
        asynchronous: false
    }));

    // viewer.entities.add({
    //     position: position,
    //     name: 'electricArc',
    //     box: {
    //         dimensions: new Cartesian3(400000.0, 400000.0, 400000.0),
    //         material: new EllipsoidElectricMaterialProperty({
    //             color: new Color(0.33, .44, 0.66, 1.),
    //             speed: 10.0,
    //             arc_mode: ArcMode.Bothway,
    //             mask: false,
    //         })
    //     }
    //     // ellipsoid: {
    //     //     radii: new Cartesian3(1000.0, 1000.0, 1000.0),
    //     //     material: new EllipsoidElectricMaterialProperty({
    //     //         color: new Color(0.33, .44, 0.66, 1.),
    //     //         speed: 10.0,
    //     //         arc_mode: ArcMode.Bothway,
    //     //         mask:false
    //     //     })
    //     // }
    // })
}