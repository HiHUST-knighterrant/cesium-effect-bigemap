// 处理多边形相交的情况
import { Cartesian2, Cartesian3, Cartographic, ClippingPlane, ClippingPlaneCollection, Color, ColorGeometryInstanceAttribute, GeometryInstance, Material, MaterialAppearance, Math, Matrix4, MultiClippingPlaneCollection, Plane, PolygonGeometry, PolygonHierarchy, Primitive, sampleTerrainMostDetailed, ScreenSpaceEventHandler, ScreenSpaceEventType, Viewer, WallGeometry } from "cesium"

type _WGS84_POSITION = {
    lon: number
    lat: number
    is_origin: boolean
}

enum _Mode {
    todo,
    draw,
    undo
}

let _status = _Mode.undo;
let _viewer: Viewer | undefined;
let _canvas: HTMLCanvasElement | undefined;
// 定义当前场景的画布元素的事件处理
let _handler: ScreenSpaceEventHandler | undefined;
let _positions: Array<Cartesian3> = [];
let _riding_index: Array<number> = [];
// 计算_positions中所有顶点投影到垂直于normal并且过原点的平面坐标
let _projection_positions: Array<Cartesian3> = [];



const difference = (last_car3: Cartesian3, current_car3: Cartesian3, next_car3: Cartesian3) => {
    const cross = Cartesian3.cross(Cartesian3.subtract(current_car3, last_car3, new Cartesian3()), Cartesian3.subtract(next_car3, current_car3, new Cartesian3()), new Cartesian3());
    if (
        (cross.x && _positions[0].x && Math.sign(cross.x) !== Math.sign(_positions[0].x)) ||
        (cross.y && _positions[0].y && Math.sign(cross.y) !== Math.sign(_positions[0].y)) ||
        (cross.z && _positions[0].z && Math.sign(cross.z) !== Math.sign(_positions[0].z))
    ) {
        // 凹多边形顶点
        return true;
    }
    return false;
}

// 切割凹多边形
const _cutting = (normal: Cartesian3) => {
    const _ploygon: Cartesian3[][] = [];
    const _riding: number[][] = [];
    const _result: Cartesian3[][] = [];
    const _projection_ploygon: Cartesian3[][] = [];

    _ploygon.push(_positions);
    _projection_ploygon.push(_projection_positions);
    _riding.push(_riding_index);
    // 这里_positions中的顶点顺序已经是逆时针
    while (_ploygon.length > 0) {
        let iterate = _ploygon.pop();
        let riding_iterate = _riding.pop();
        let projection_iterate = _projection_ploygon.pop()!;

        if (riding_iterate!.length === 0) {
            _result.push(iterate!);
            continue;
        }

        const v = riding_iterate!.pop()!;
        const last_i = v - 1 === -1 ? projection_iterate.length - 1 : v - 1;
        const l1p1 = projection_iterate[last_i];
        const l1p2 = projection_iterate[v];

        // 求射线和多边形边的交点 当求出射线与一条多边形的边有交点后(假设射线为AB 多边形边为CD 交点为O) 还需要判断AO与其他边没有交点才算找到有效分割交点 不然继续循环下一条边 所以其实就是和所有的边求交之后 比较所有的交点到凹顶点的距离 最近的则为有效分给交点
        let intersection_min_distance = Number.POSITIVE_INFINITY;
        let intersection_position: Cartesian3;
        let intersection_index: number;
        projection_iterate.forEach(
            (val, index) => {
                const last_index = index - 1 === -1 ? projection_iterate.length - 1 : index - 1;
                if (index === v || index === last_i || last_index === v || last_index === last_i) return;
                const l2p1 = projection_iterate[last_index];
                const l2p2 = val;

                const l_cross = Cartesian3.cross(
                    Cartesian3.subtract(l1p2, l1p1, new Cartesian3()),
                    Cartesian3.subtract(l2p1, l1p1, new Cartesian3()),
                    new Cartesian3()
                );
                const i_cross = Cartesian3.cross(
                    Cartesian3.subtract(l1p2, l1p1, new Cartesian3()),
                    Cartesian3.subtract(l2p2, l1p1, new Cartesian3()),
                    new Cartesian3()
                );

                if (
                    (i_cross.x && l_cross.x && Math.sign(i_cross.x) !== Math.sign(l_cross.x)) ||
                    (i_cross.y && l_cross.y && Math.sign(i_cross.y) !== Math.sign(l_cross.y)) ||
                    (i_cross.z && l_cross.z && Math.sign(i_cross.z) !== Math.sign(l_cross.z))
                ) {
                    // 有交点 求空间中两直线的交点 利用空间参数式直线方程
                    const t = (((l1p1.y - l2p1.y) * (l2p1.x - l2p2.x) - (l2p1.y - l2p2.y) * (l1p1.x - l2p1.x)) / ((l2p1.y - l2p2.y) * (l1p1.x - l1p2.x) - (l2p1.x - l2p2.x) * (l1p1.y - l1p2.y)));
                    const x = l1p1.x + (l1p1.x - l1p2.x) * t;
                    const y = l1p1.y + (l1p1.y - l1p2.y) * t;
                    const z = l1p1.z + (l1p1.z - l1p2.z) * t;

                    const distance = (x - l1p2.x) * (x - l1p2.x) + (y - l1p2.y) * (y - l1p2.y) + (z - l1p2.z) * (z - l1p2.z);
                    distance < intersection_min_distance && (intersection_min_distance = distance) && (intersection_position = new Cartesian3(x, y, z)) && (intersection_index = index);
                }
            }
        );

        if (intersection_min_distance === Number.POSITIVE_INFINITY) {
            // 说明当前凹顶点在其他凹顶点的拆分过程中 已经变为拆分后多边形的凸顶点 所以不需要再拆分
            console.warn(`凹顶点在拆分多边形时变为凸顶点`);
            _ploygon.push(iterate!);
            _riding.push(riding_iterate!);
            _projection_ploygon.push(projection_iterate);
            continue;
        }

        const ploygon1 = [];
        const ploygon2 = [];
        ploygon1.push(v);
        ploygon2.push(last_i);
        // 少循环2次 因为凹顶点处的索引和它前面一个索引已经拆分到对应的数组了
        let count = 2;
        let v_iterate = (v + 1) % projection_iterate.length;
        let ploygon1_flag = true;
        let ploygon2_flag = false;
        const intersection_flag = 999;
        while (count < projection_iterate.length) {
            if (v_iterate === intersection_index!) {
                ploygon1.push(intersection_flag);
                ploygon2.push(intersection_flag);
                ploygon1_flag = false;
                ploygon2_flag = true;
            }

            ploygon1_flag && ploygon1.push(v_iterate);
            ploygon2_flag && ploygon2.push(v_iterate);

            v_iterate = (v_iterate + 1) % projection_iterate.length;
            count++;
        };

        const new_positions1: Array<Cartesian3> = [];
        const new_positions2: Array<Cartesian3> = [];
        const new_projection_position1: Array<Cartesian3> = [];
        const new_projection_position2: Array<Cartesian3> = [];
        const new_riding1: Array<number> = [];
        const new_riding2: Array<number> = [];

        // 经验算法
        const intersection_reprojection_position = Cartesian3.add(intersection_position!, Cartesian3.multiplyByScalar(normal, _reprojection(intersection_position!, normal)[1], new Cartesian3()), new Cartesian3());

        let coincide1 = false;
        ploygon1.forEach(
            (v, i) => {
                if (v === intersection_flag) {
                    // 把投影坐标映射回球体表面 
                    new_positions1.push(intersection_reprojection_position);
                    new_projection_position1.push(intersection_position);
                } else {
                    if (riding_iterate!.indexOf(v) !== -1) {
                        new_riding1.push(i);
                    }
                    new_positions1.push(iterate![v]);
                    new_projection_position1.push(projection_iterate[v]);
                    if (intersection_position.x === projection_iterate[v].x && intersection_position.y === projection_iterate[v].y && intersection_position.z === projection_iterate[v].z) coincide1 = true;
                }
            }
        );
        // 当前凹顶点拆分多边形时 与其他多边形边的交点可能是其他凸顶点或凹顶点
        coincide1 && new_positions1.splice(ploygon1.indexOf(intersection_flag), 1) && new_projection_position1.splice(ploygon1.indexOf(intersection_flag), 1);


        let coincide2 = false;
        ploygon2.forEach(
            (v, i) => {
                if (v === intersection_flag) {
                    // 把投影坐标映射会球体表面 
                    new_positions2.push(intersection_reprojection_position);
                    new_projection_position2.push(intersection_position);
                } else {
                    if (riding_iterate!.indexOf(v) !== -1) {
                        new_riding2.push(i);
                    }
                    new_positions2.push(iterate![v]);
                    new_projection_position2.push(projection_iterate[v]);
                    if (intersection_position.x === projection_iterate[v].x && intersection_position.y === projection_iterate[v].y && intersection_position.z === projection_iterate[v].z) coincide2 = true;
                }
            }
        );
        // 当前凹顶点拆分多边形时 与其他多边形边的交点可能是其他凸顶点或凹顶点
        coincide2 && new_positions2.splice(ploygon2.indexOf(intersection_flag), 1) && new_projection_position2.splice(ploygon2.indexOf(intersection_flag), 1);


        _ploygon.push(new_positions1);
        _riding.push(new_riding1);
        _projection_ploygon.push(new_projection_position1);

        _ploygon.push(new_positions2);
        _riding.push(new_riding2);
        _projection_ploygon.push(new_projection_position2);
    };

    return _result;
}

//射线与球体相交, x 到球体最近的距离， y 穿过球体的距离
//原理是将射线方程(x = o + dl)带入球面方程求解(|x - c|^2 = r^2)
const _reprojection = (origin: Cartesian3, direction: Cartesian3) => {
    const sphere_center = new Cartesian3(0, 0, 0);
    const sphere_radius = _viewer!.scene.globe.ellipsoid.maximumRadius;
    const oc = Cartesian3.subtract(origin, sphere_center, new Cartesian3());
    const b = Cartesian3.dot(direction, oc);
    const c = Cartesian3.dot(oc, oc) - sphere_radius * sphere_radius;
    const t = b * b - c;
    const delta = window.Math.sqrt(window.Math.max(t, 0.));
    const dsttosphere = window.Math.max(-b - delta, 0.);
    const dstinsphere = window.Math.max(-b + delta - dsttosphere, 0.);
    return [dsttosphere, dstinsphere];
}

const _updatePoint = (position: Cartesian2) => {
    // const cartesian = _viewer!.camera.pickEllipsoid(position);
    const ray = _viewer!.camera.getPickRay(position);
    const cartesian = _viewer!.scene.globe.pick(ray!, _viewer!.scene);
    if (_positions.length && (cartesian!.x === _positions[_positions.length - 1].x && cartesian!.y === _positions[_positions.length - 1].y)) return;
    _positions.push(cartesian!);
    // const cartographic = Cartographic.fromCartesian(cartesian!);
    // const lng = Math.toDegrees(cartographic.longitude); // 经度
    // const lat = Math.toDegrees(cartographic.latitude); // 纬度
    // const alt = cartographic.height; // 高度
    // const coordinate = {
    //     longitude: Number(lng.toFixed(6)),
    //     latitude: Number(lat.toFixed(6)),
    //     altitude: Number(alt.toFixed(2))
    // };
}

// 进入裁剪模式
export const enter = (
    viewer: Viewer,
    options?: {
        collections?: ClippingPlaneCollection[]
        edgeWidth?: number
        edgeColor?: Color
        modelMatrix?: Matrix4
    }
) => {
    if (_status < _Mode.undo) return;
    _viewer = viewer;
    _viewer.scene.globe.multiClippingPlanes = new MultiClippingPlaneCollection(options ? options : undefined);
    _status = _Mode.todo;
}

// 退出裁剪模式
export const exit = () => {
    if (_status == _Mode.undo) return;
    _viewer!.scene.globe.multiClippingPlanes!.destroy();
    _viewer!.scene.globe.multiClippingPlanes = undefined;
    _viewer = undefined;
    _canvas = undefined;
    _positions = [];
    _handler && _handler.destroy();
    _handler = undefined;
    _status = _Mode.undo;

}

export const draw = () => {
    return new Promise<ClippingPlaneCollection[]>((resolve, reject) => {
        if (_status == _Mode.undo) return reject("请先调用enter指令");
        _handler && _handler.destroy();
        _canvas = _viewer!.scene.canvas;
        _handler = new ScreenSpaceEventHandler(_canvas);
        _positions = [];
        _riding_index = [];
        _projection_positions = [];
        //设置鼠标移动事件的处理函数，这里负责监听x,y坐标值变化
        _handler.setInputAction(
            function (event: any) {
                _updatePoint(event.position);
            },
            ScreenSpaceEventType.LEFT_CLICK
        );

        _handler.setInputAction(
            async () => {
                _canvas = undefined;
                _handler!.destroy();
                _handler = undefined;

                if (_positions.length >= 3) {
                    // 不考虑顶点乱序的情况 默认只能是顺时针或者逆时针 最后都转换为逆时针顺序

                    // 先计算平面的法线
                    let x_min = Number.POSITIVE_INFINITY, x_max = Number.NEGATIVE_INFINITY, y_min = Number.POSITIVE_INFINITY, y_max = Number.NEGATIVE_INFINITY, z_min = Number.POSITIVE_INFINITY, z_max = Number.NEGATIVE_INFINITY;
                    _positions.forEach((v) => {
                        v.x < x_min && (x_min = v.x);
                        v.x > x_max && (x_max = v.x);
                        v.y < y_min && (y_min = v.y);
                        v.y > y_max && (y_max = v.y);
                        v.z < z_min && (z_min = v.z);
                        v.z > z_max && (z_max = v.z);
                    });
                    let normal = Cartesian3.normalize(new Cartesian3((x_min + x_max) / 2, (y_min + y_max) / 2, (z_min + z_max) / 2), new Cartesian3());
                    const raised_index: Array<number> = [];
                    _positions.forEach(
                        (v) => {
                            const t = - (normal.x * v.x + normal.y * v.y + normal.z * v.z) / normal.x * normal.x + normal.y * normal.y + normal.z * normal.z
                            const x = normal.x * t + v.x;
                            const y = normal.y * t + v.y;
                            const z = normal.z * t + v.z;
                            _projection_positions.push(new Cartesian3(x, y, z));
                        }
                    );

                    // 判断顶点的顺序是逆时针还是顺时针 必须使用凸顶点判断 使用_projection_positions排除凹顶点
                    let last_riding = false;
                    _projection_positions.forEach(
                        (val, index) => {
                            if (last_riding) {
                                raised_index.push(index);
                                last_riding = false;
                                return;
                            }

                            const last_index = index - 1 === -1 ? _projection_positions.length - 1 : index - 1;
                            let riding = false;

                            // 判断last_index到index这条射线与投影多边形除了当前点是交点外 是否还有其他交点 如果有说明该点为凹顶点
                            for (let i = 0; i < _projection_positions.length; i++) {
                                const l = i - 1 === -1 ? _projection_positions.length - 1 : i - 1;
                                if (l === last_index || l === index || i === last_index || i === index) continue;
                                const i_cross = Cartesian3.cross(Cartesian3.subtract(val, _projection_positions[last_index], new Cartesian3()), Cartesian3.subtract(_projection_positions[i], _projection_positions[last_index], new Cartesian3()), new Cartesian3());
                                const l_cross = Cartesian3.cross(Cartesian3.subtract(val, _projection_positions[last_index], new Cartesian3()), Cartesian3.subtract(_projection_positions[l], _projection_positions[last_index], new Cartesian3()), new Cartesian3());


                                if (
                                    (i_cross.x && l_cross.x && Math.sign(i_cross.x) !== Math.sign(l_cross.x)) ||
                                    (i_cross.y && l_cross.y && Math.sign(i_cross.y) !== Math.sign(l_cross.y)) ||
                                    (i_cross.z && l_cross.z && Math.sign(i_cross.z) !== Math.sign(l_cross.z))
                                ) {
                                    // 有其他的交点
                                    riding = true;
                                    last_riding = true;
                                    break;
                                }
                            }

                            riding ? _riding_index.push(index) : raised_index.push(index);
                        }
                    );


                    // 判断_positions顶点顺序 转换为逆时针 并更新_riding_index中的记录的_positions凹顶点的索引位置
                    difference(_positions[raised_index[0] - 1 === -1 ? _positions.length - 1 : raised_index[0] - 1], _positions[raised_index[0]], _positions[(raised_index[0] + 1) % _positions.length]) && _positions.reverse() && _projection_positions.reverse() && (_riding_index = _riding_index.map(v => _positions.length - 1 - v));

                    // 凹多边形检测、拆分
                    const planes = _cutting(normal);

                    const collections: ClippingPlaneCollection[] = [];

                    planes.forEach(
                        (v) => {
                            const clippingPlanes = [];
                            for (let i = 0; i < v.length; ++i) {
                                const nextIndex = (i + 1) % v.length;
                                let midpoint = Cartesian3.add(v[i], v[nextIndex], new Cartesian3());
                                midpoint = Cartesian3.multiplyByScalar(midpoint, 0.5, midpoint);

                                const up = Cartesian3.normalize(midpoint, new Cartesian3());
                                let right = Cartesian3.subtract(v[nextIndex], midpoint, new Cartesian3());
                                right = Cartesian3.normalize(right, right);

                                let normal = Cartesian3.cross(right, up, new Cartesian3());
                                normal = Cartesian3.normalize(normal, normal);

                                const originCenteredPlane = new Plane(normal, 0.0);
                                const distance = Plane.getPointDistance(originCenteredPlane, midpoint);
                                clippingPlanes.push(new ClippingPlane(normal, distance));
                            }

                            const collection = new ClippingPlaneCollection({ planes: clippingPlanes });
                            _viewer!.scene.globe.multiClippingPlanes!.add(collection);
                            collections.push(collection);

                        }
                    );

                    // 生成贴图
                    const positions = await _lerp(_positions);
                    console.log(1112222);
                    _createBottomSurface(positions.position_bottom_surface);
                    _createWellWall(positions.position, positions.min_heights, positions.max_heights);
                    resolve(collections);
                }

                _positions = [];
                _riding_index = [];
                _projection_positions = [];
                _status = _Mode.todo;
                reject("顶点数小于3个 不满足裁剪面的定义");
            },
            ScreenSpaceEventType.LEFT_DOUBLE_CLICK
        );
    });
}

// 删除裁剪面
export const remove = (ClippingPlaneCollection: ClippingPlaneCollection) => {
    if (_status == _Mode.undo) return;
    _viewer!.scene.globe.multiClippingPlanes!.remove(ClippingPlaneCollection);
}

// 删除所有裁剪面
export const removeAll = () => {
    if (_status == _Mode.undo) return;
    _viewer!.scene.globe.multiClippingPlanes!.removeAll();
}

const _ellipsoidToLonLat = async function (c: _WGS84_POSITION[]) {
    // _reproject拆分多边形交点坐标然后重投影回cesium 笛卡尔坐标系的球面时使用的经验算法 所以高程有问题不能使用 需要重新获取
    // let alt = _viewer!.scene.globe.getHeight(cartographic);
    return await sampleTerrainMostDetailed(_viewer!.terrainProvider, c.map(v => new Cartographic(v.lon, v.lat)));
}

const _lerp = async (t: Cartesian3[]) => {
    let offset = 200;
    let min = Number.POSITIVE_INFINITY;
    const max_heights: number[] = [];
    const min_heights: number[] = [];
    const position: Cartesian3[] = [];
    const wgs84: _WGS84_POSITION[] = [];
    const position_bottom_surface: number[] = [];


    for (let i = 0; i < t.length; i++) {
        const next_i = (i + 1) % t.length;
        const cartographic_i = _viewer!.scene.globe.ellipsoid.cartesianToCartographic(t[i]);
        const cartographic_next_i = _viewer!.scene.globe.ellipsoid.cartesianToCartographic(t[next_i]);

        for (let p = 0; p <= 1000; p++) {
            let m = Math.lerp(cartographic_i.longitude, cartographic_next_i.longitude, p / 1000),
                g = Math.lerp(cartographic_i.latitude, cartographic_next_i.latitude, p / 1000),
                f = Cartesian3.fromRadians(m, g, 0);
            (p !== 1000 || i == t.length - 1) && (position.push(f) && wgs84.push({ lon: m, lat: g, is_origin: p === 0 }));
        }
    }

    const effective = await _ellipsoidToLonLat(wgs84);
    effective.forEach(v => v.height < min && (min = v.height));
    effective.forEach((v, i) => max_heights.push(v.height) && min_heights.push(min - offset) && wgs84[i].is_origin && position_bottom_surface.push(wgs84[i].lon, wgs84[i].lat, min - offset));

    return {
        position: position,
        max_heights: max_heights,
        min_heights: min_heights,
        position_bottom_surface: position_bottom_surface
    }
}

const _createBottomSurface = (e: number[]) => {
    let polygon = new PolygonGeometry({
        polygonHierarchy: new PolygonHierarchy(
            Cartesian3.fromRadiansArrayHeights(e)
        ),
        perPositionHeight: true,
        closeBottom: false
    });
    let geometry = PolygonGeometry.createGeometry(polygon)!;

    var i = new Material({
        fabric: {
            type: "Image",
            uniforms: {
                image: '../file/texture/poly-soil.jpg'
            }
        }
    }),
        a = new MaterialAppearance({
            translucent: false,
            flat: true,
            material: i
        }),
        bottomSurface = new Primitive({
            geometryInstances: new GeometryInstance({
                geometry: geometry
            }),
            appearance: a,
            asynchronous: false
        });
    _viewer!.scene.primitives.add(bottomSurface)

}


const _createWellWall = async function (position: Cartesian3[], min_heights: number[], max_heights: number[]) {
    let wall = new WallGeometry({
        positions: position,
        maximumHeights: max_heights,
        minimumHeights: min_heights
    });

    let geometry = WallGeometry.createGeometry(wall)!;
    var a = new Material({
        fabric: {
            type: "Image",
            uniforms: {
                image: '../file/texture/poly-stone.jpg'
            }
        }
    }),
        n = new MaterialAppearance({
            translucent: false,
            flat: true,
            material: a
        }),
        wellWall = new Primitive({
            geometryInstances: new GeometryInstance({
                geometry: geometry,
                attributes: {
                    color: ColorGeometryInstanceAttribute.fromColor(Color.GREY)
                },
                id: "PitWall"
            }),
            appearance: n,
            asynchronous: false
        });
    _viewer!.scene.primitives.add(wellWall)
}