// 处理多边形相交的情况
import { Cartesian2, Cartesian3, Cartographic, ClippingPlane, ClippingPlaneCollection, Color, ColorGeometryInstanceAttribute, Entity, GeometryInstance, Material, MaterialAppearance, Math, Matrix4, MultiClippingPlaneCollection, Plane, PolygonGeometry, PolygonHierarchy, PolylineGraphics, Primitive, sampleTerrainMostDetailed, ScreenSpaceEventHandler, ScreenSpaceEventType, Viewer, WallGeometry, WebMercatorProjection } from "cesium"

enum _Mode {
    todo,
    draw,
    undo
}

type _WGS84_POSITION = {
    lon: number
    lat: number
    height?: number
}

type _CUTTING_ID = number;
type _WALL_ID = number;
type _PROJECTION_ID = number;
type _COLLECTION_ID = number;
type _BOTTOMSURFACE_ID = number;


let _draw_time: number | undefined;
let _status = _Mode.undo;
let _viewer: Viewer | undefined;
let _canvas: HTMLCanvasElement | undefined;
// 定义当前场景的画布元素的事件处理
let _handler: ScreenSpaceEventHandler | undefined;
const _web_mercator = new WebMercatorProjection();
let _reject: ((reason?: any) => void) | undefined;
// 保存多边形拆分时的延长线 也是拆分后两个多边形的共线线段
let _collineation: [Cartesian2, Cartesian2][] = [];
// 保存相交多边形的线段
let _intersection_line: [Cartesian2, Cartesian2][] = [];


let _ploygons: Cartesian3[][] = [];
let _ploygons_boundingbox: { min_x: number, max_x: number, min_y: number, max_y: number }[] = [];
let _wall: Primitive[] = [];
let _projections: Cartesian3[][] = [];
let _projection2WallIndex: { [index: _PROJECTION_ID]: _WALL_ID } = {};
let _cutting2projection_positions: { [index: _CUTTING_ID]: _PROJECTION_ID } = {};
let _projection2Cutting: { [index: _PROJECTION_ID]: _CUTTING_ID[] } = {};
let _clippingPlaneCollections: ClippingPlaneCollection[][] = [];
let _projection2Collection: { [index: _PROJECTION_ID]: _COLLECTION_ID } = {};
let _bottomSurfaces: Primitive[] = [];
let _projection2BottomSurface: { [index: _PROJECTION_ID]: _BOTTOMSURFACE_ID } = {};


// 切割凹多边形
const _cutting = (_projection_positions: Cartesian3[], _riding_index: number[]) => {
    const _riding: number[][] = [];
    // const _result: Cartographic[][] = [];
    const _result: { cartographic: Cartographic[][], mercator: Cartesian3[][] } = { cartographic: [], mercator: [] };
    const _projection_ploygon: Cartesian3[][] = [];

    _projection_ploygon.push(_projection_positions);
    _riding.push(_riding_index);

    // 这里_positions中的顶点顺序已经是逆时针
    while (_projection_ploygon.length > 0) {
        let riding_iterate = _riding.pop();
        let projection_iterate = _projection_ploygon.pop()!;

        if (riding_iterate!.length === 0) {
            _result.mercator.push(projection_iterate);
            _result.cartographic.push(projection_iterate.map(v => _web_mercator.unproject(v)));
            continue;
        }

        const v = riding_iterate!.pop()!;
        const last_i = v - 1 === -1 ? projection_iterate.length - 1 : v - 1;
        const l1p1 = projection_iterate[last_i];
        const l1p2 = projection_iterate[v];

        // 求射线和多边形边的交点 当求出射线与一条多边形的边有交点后(假设射线为AB 多边形边为CD 交点为O) 还需要判断AO与其他边没有交点才算找到有效分割交点 不然继续循环下一条边 所以其实就是和所有的边求交之后 比较所有的交点到凹顶点的距离 最近的则为有效分割交点
        let intersection_min_distance = Number.POSITIVE_INFINITY;
        let intersection_position: Cartesian2;
        let intersection_index: number;
        projection_iterate.forEach(
            (val, index) => {
                const last_index = index - 1 === -1 ? projection_iterate.length - 1 : index - 1;
                if (index === v || index === last_i || last_index === v || last_index === last_i) return;
                const l2p1 = projection_iterate[last_index];
                const l2p2 = val;

                const l_cross = Cartesian2.cross(
                    Cartesian2.subtract(l1p2, l1p1, new Cartesian2()),
                    Cartesian2.subtract(l2p1, l1p1, new Cartesian2())
                );
                const i_cross = Cartesian2.cross(
                    Cartesian2.subtract(l1p2, l1p1, new Cartesian2()),
                    Cartesian2.subtract(l2p2, l1p1, new Cartesian2())
                );

                if (!i_cross || !l_cross) console.warn(`叉乘结果为0(2)`)

                if (
                    Math.sign(i_cross) !== Math.sign(l_cross)
                ) {
                    // 有交点 求空间中两直线的交点 利用空间参数式直线方程
                    const t = (((l1p1.y - l2p1.y) * (l2p1.x - l2p2.x) - (l2p1.y - l2p2.y) * (l1p1.x - l2p1.x)) / ((l2p1.y - l2p2.y) * (l1p1.x - l1p2.x) - (l2p1.x - l2p2.x) * (l1p1.y - l1p2.y)));
                    const x = l1p1.x + (l1p1.x - l1p2.x) * t;
                    const y = l1p1.y + (l1p1.y - l1p2.y) * t;

                    const distance = (x - l1p2.x) * (x - l1p2.x) + (y - l1p2.y) * (y - l1p2.y);
                    distance < intersection_min_distance && (intersection_min_distance = distance) && (intersection_position = new Cartesian2(x, y)) && (intersection_index = index);
                }
            }
        );

        if (intersection_min_distance === Number.POSITIVE_INFINITY) {
            // 说明当前凹顶点在其他凹顶点的拆分过程中 已经变为拆分后多边形的凸顶点 所以不需要再拆分
            console.warn(`凹顶点在拆分多边形时变为凸顶点`);
            _riding.push(riding_iterate!);
            _projection_ploygon.push(projection_iterate);
            continue;
        }

        // 保存拆分的线段
        _collineation.push([new Cartesian2(projection_iterate[v].x, projection_iterate[v].y), intersection_position!]);

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

        const new_projection_position1: Array<Cartesian3> = [];
        const new_projection_position2: Array<Cartesian3> = [];
        const new_riding1: Array<number> = [];
        const new_riding2: Array<number> = [];

        let coincide1 = false;
        ploygon1.forEach(
            (v, i) => {
                if (v === intersection_flag) {
                    new_projection_position1.push(new Cartesian3(intersection_position.x, intersection_position.y, 0));
                } else {
                    if (riding_iterate!.indexOf(v) !== -1) {
                        new_riding1.push(i);
                    }
                    new_projection_position1.push(projection_iterate[v]);
                    if (intersection_position.x === projection_iterate[v].x && intersection_position.y === projection_iterate[v].y) coincide1 = true;
                }
            }
        );
        // 当前凹顶点拆分多边形时 与其他多边形边的交点可能是其他凸顶点或凹顶点
        coincide1 && new_projection_position1.splice(ploygon1.indexOf(intersection_flag), 1);


        let coincide2 = false;
        ploygon2.forEach(
            (v, i) => {
                if (v === intersection_flag) {
                    new_projection_position2.push(new Cartesian3(intersection_position.x, intersection_position.y, 0));
                } else {
                    if (riding_iterate!.indexOf(v) !== -1) {
                        new_riding2.push(i);
                    }
                    new_projection_position2.push(projection_iterate[v]);
                    if (intersection_position.x === projection_iterate[v].x && intersection_position.y === projection_iterate[v].y) coincide2 = true;
                }
            }
        );
        // 当前凹顶点拆分多边形时 与其他多边形边的交点可能是其他凸顶点或凹顶点
        coincide2 && new_projection_position2.splice(ploygon2.indexOf(intersection_flag), 1);


        _riding.push(new_riding1);
        _projection_ploygon.push(new_projection_position1);

        _riding.push(new_riding2);
        _projection_ploygon.push(new_projection_position2);
    };

    return _result;
}

const _updatePoint = (_positions: Cartesian3[], position: Cartesian2) => {
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
    _canvas = _viewer!.scene.canvas;
    _handler = new ScreenSpaceEventHandler(_canvas);
}

const _clear = () => {
    _reject = undefined;
    _collineation = [];
    _intersection_line = [];
    _ploygons = [];
    _ploygons_boundingbox = [];
    _wall = [];
    _projections = [];
    _projection2WallIndex = {};
    _cutting2projection_positions = {};
    _draw_time = undefined;
}

// 退出裁剪模式
export const exit = () => {
    if (_status == _Mode.undo) return;
    _viewer!.scene.globe.multiClippingPlanes!.destroy();
    _viewer!.scene.globe.multiClippingPlanes = undefined;
    _viewer = undefined;
    _canvas = undefined;
    _handler && _handler.destroy();
    _handler = undefined;
    _clear();
    _status = _Mode.undo;

}


export const draw = async () => {
    console.log("start");
    return new Promise<_PROJECTION_ID>((resolve, reject) => {
        switch (_status) {
            case _Mode.undo: return reject("请先调用enter指令");
            case _Mode.draw: _reject!(`已被重置`); break;
            case _Mode.todo: _status = _Mode.draw; break;
        }

        _draw_time === undefined && (_draw_time = new Date().getTime());
        const _this_draw_time = _draw_time;

        _reject = reject;
        const _positions: Array<Cartesian3> = [];
        let _riding_index: Array<number> = [];
        // 计算_positions中所有顶点投影web墨卡托坐标系
        const _projection_positions: Array<Cartesian3> = [];
        //设置鼠标移动事件的处理函数，这里负责监听x,y坐标值变化
        _handler!.setInputAction(
            function (event: any) {
                _updatePoint(_positions, event.position);
            },
            ScreenSpaceEventType.LEFT_CLICK
        );

        _handler!.setInputAction(
            async () => {
                _status = _Mode.todo;
                _reject = undefined;
                _handler!.removeInputAction(ScreenSpaceEventType.LEFT_CLICK);
                _handler!.removeInputAction(ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

                if (_positions.length >= 3) {
                    // 存储需要重新更新的之前的多边形 由于之前的多边形和当前绘制的多边形有交集所以需要重新更新
                    let _need_update_polygons: number[] = [];
                    // 不考虑顶点乱序的情况 默认只能是顺时针或者逆时针 最后都转换为逆时针顺序
                    const raised_index: Array<number> = [];
                    _positions.forEach(
                        (v) => {
                            _projection_positions.push(_web_mercator.project(_viewer!.scene.globe.ellipsoid.cartesianToCartographic(v)));
                        }
                    );

                    // 判断顶点的顺序是逆时针还是顺时针 并判断顶点是否为凹顶点
                    let last_riding = false;
                    let positive = false;
                    let negative = false;
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
                                if ((l === last_index || l === index || i === last_index || i === index) && _projection_positions.length !== 3) continue;
                                const i_cross = Cartesian2.cross(Cartesian2.subtract(new Cartesian2(val.x, val.y), new Cartesian2(_projection_positions[last_index].x, _projection_positions[last_index].y), new Cartesian2()), Cartesian2.subtract(new Cartesian2(_projection_positions[i].x, _projection_positions[i].y), new Cartesian2(_projection_positions[last_index].x, _projection_positions[last_index].y), new Cartesian2()));

                                const l_cross = Cartesian2.cross(Cartesian2.subtract(new Cartesian2(val.x, val.y), new Cartesian2(_projection_positions[last_index].x, _projection_positions[last_index].y), new Cartesian2()), Cartesian2.subtract(new Cartesian2(_projection_positions[l].x, _projection_positions[l].y), new Cartesian2(_projection_positions[last_index].x, _projection_positions[last_index].y), new Cartesian2()));

                                if ((!i_cross || !l_cross) && _projection_positions.length !== 3) console.warn(`叉乘结果为0(1)`)

                                if (
                                    Math.sign(i_cross) !== Math.sign(l_cross) &&
                                    _projection_positions.length !== 3
                                ) {
                                    // 有其他的交点
                                    riding = true;
                                    last_riding = true;
                                    break;
                                } else if (Math.sign(i_cross) === 1) {
                                    positive = true;
                                } else if (Math.sign(i_cross) === -1) {
                                    negative = true;
                                }
                            }

                            riding ? _riding_index.push(index) : raised_index.push(index);
                        }
                    );

                    // 出现异常情况
                    if (_projection_positions.length !== 3 && positive === negative) {
                        return reject("检查顶点顺序 无法判断是否为逆时针或者顺时针");
                    }

                    // 判断_positions顶点顺序 转换为逆时针 并更新_riding_index中的记录的_positions凹顶点的索引位置
                    negative && _positions.reverse() && _projection_positions.reverse() && (_riding_index = _riding_index.map(v => _positions.length - 1 - v));

                    // 凹多边形检测、拆分
                    const planes = _cutting(_projection_positions, _riding_index);
                    const lengths: number[] = planes.cartographic.map(v => v.length);
                    const wgs84: _WGS84_POSITION[] = planes.cartographic.flat().map(v => {
                        return {
                            lon: v.longitude,
                            lat: v.latitude,
                            is_origin: true
                        }
                    });
                    const effective = await _ellipsoidToLonLat(wgs84);
                    if (_this_draw_time !== _draw_time) return;
                    const planes_effective: Cartesian3[][] = [];
                    lengths.forEach((v, i) => {
                        let s = 0;
                        const plane_effective: Cartesian3[] = [];
                        for (let ss = i - 1; ss > -1; ss--) {
                            s += lengths[ss];
                        }

                        for (let ii = s; ii < v + s; ii++) {
                            plane_effective.push(Cartesian3.fromRadians(effective[ii].longitude, effective[ii].latitude, effective[ii].height));
                        }
                        planes_effective.push(plane_effective);
                    });


                    const collections: ClippingPlaneCollection[] = [];

                    planes_effective.forEach(
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

                    // 拿到拆分后的多边形分别与已经存在的多边形进行相交判断 并求出两个多边形的交集形成的新的多边形 并保存新多边形的线段
                    const _ploygons_backup = [..._ploygons];
                    const _ploygons_boundingbox_backup = [..._ploygons_boundingbox];

                    const cutting_index: number[] = [];

                    const _projection_index = _projections.push(_projection_positions) - 1;
                    // 计算boundingbox 更新_ploygons和_ploygons_boundingbox
                    planes.mercator.forEach(val => {
                        cutting_index.push(_ploygons.push(val) - 1);
                        let [min_x, max_x, min_y, max_y] = [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY];
                        val.forEach(v => {
                            min_x = window.Math.min(min_x, v.x);
                            max_x = window.Math.max(max_x, v.x);
                            min_y = window.Math.min(min_y, v.y);
                            max_y = window.Math.max(max_y, v.y);
                        });
                        _ploygons_boundingbox.push({
                            min_x: min_x,
                            max_x: max_x,
                            min_y: min_y,
                            max_y: max_y
                        });

                        // 利用boundingbox快速判断多边形是否相交
                        _ploygons_boundingbox_backup.forEach((boundingbox, i) => {
                            if ((max_x <= boundingbox.min_x) || (min_x >= boundingbox.max_x) || (max_y <= boundingbox.min_y) || (min_y >= boundingbox.max_y)) return;
                            // 和该多边形一个拆分组的多边形全部一起更新
                            _need_update_polygons.push(_cutting2projection_positions[i]);

                            // 相交 先计算得到交集多边形的顶点
                            const polygonA = val;
                            const polygonB = _ploygons_backup[i];
                            // 记录交集的顶点
                            const intersection_points: Cartesian2[] = [];

                            // 每条边求交点
                            polygonA.forEach(
                                (va, ia) => {
                                    const ia_next = (ia + 1) % polygonA.length;
                                    // 判断polygonA中的当前顶点是否在polygonB中
                                    _pointInsidePolygon(va, polygonB) && intersection_points.push(new Cartesian2(va.x, va.y));

                                    polygonB.forEach(
                                        (vb, ib) => {
                                            const ib_next = (ib + 1) % polygonB.length
                                            // 判断polygonB中的当前顶点是否在polygonA中 因为是嵌套循环 而我们只需要判断一次polygonB中的顶点是否在polygonA中 所以需要判断一下当前polygonA的索引是否为0
                                            !ia && _pointInsidePolygon(vb, polygonA) && intersection_points.push(new Cartesian2(vb.x, vb.y));

                                            // 两条线段是否相交
                                            const intersection = _segmentsIntersectionPoint(va, polygonA[ia_next], vb, polygonB[ib_next]);
                                            intersection && intersection_points.push(new Cartesian2(intersection.x, intersection.y));
                                        }
                                    );
                                }
                            );

                            // 拿到所有的顶点进行凸多边形顶点排序 凸包计算 由于都是凸多边形 这里不需要考虑凹多边形
                            /**
                             * 根据交集顶点列表找到一个内点 然后根据以该内点为原点 把所有交集顶点为到4个象限后 再对每个象限进行排序即可
                             * A: x>0 y>=0
                             * B: x<=0 y>0
                             * C: x<0 y<=0
                             * D: x>=0 y<0
                             */
                            if (intersection_points.length >= 3) {
                                const quadrant_a: Cartesian2[] = [];
                                const quadrant_b: Cartesian2[] = [];
                                const quadrant_c: Cartesian2[] = [];
                                const quadrant_d: Cartesian2[] = [];
                                const quadrant_a_sin: number[] = [];
                                const quadrant_b_sin: number[] = [];
                                const quadrant_c_sin: number[] = [];
                                const quadrant_d_sin: number[] = [];
                                const intersection_polygon: Cartesian2[] = [];
                                const origin = Cartesian2.divideByScalar(
                                    Cartesian2.add(Cartesian2.add(intersection_points[0], intersection_points[1], new Cartesian2()), intersection_points[2], new Cartesian2()),
                                    3,
                                    new Cartesian2()
                                );
                                intersection_points.forEach(
                                    v => {
                                        const v_origin = Cartesian2.subtract(v, origin, new Cartesian2());
                                        const sin_points2origin = v_origin.y / window.Math.sqrt(v_origin.x * v_origin.x + v_origin.y * v_origin.y);
                                        if (v_origin.x > 0 && v_origin.y >= 0)
                                            quadrant_a.push(v) && quadrant_a_sin.push(sin_points2origin);
                                        else if (v_origin.x <= 0 && v_origin.y > 0)
                                            quadrant_b.push(v) && quadrant_b_sin.push(sin_points2origin);
                                        else if (v_origin.x < 0 && v_origin.y <= 0)
                                            quadrant_c.push(v) && quadrant_c_sin.push(sin_points2origin);
                                        else if (v_origin.x >= 0 && v_origin.y < 0)
                                            quadrant_d.push(v) && quadrant_d_sin.push(sin_points2origin);
                                        else console.warn(`交集多边形顶点象限判断异常${v_origin.x, v_origin.y}`);
                                    }
                                );

                                if (quadrant_a) [...quadrant_a_sin].sort((a, b) => a - b).forEach(sin => intersection_polygon.push(quadrant_a[quadrant_a_sin.indexOf(sin)]));
                                if (quadrant_b) [...quadrant_b_sin].sort((a, b) => b - a).forEach(sin => intersection_polygon.push(quadrant_b[quadrant_b_sin.indexOf(sin)]))
                                if (quadrant_c) [...quadrant_c_sin].sort((a, b) => b - a).forEach(sin => intersection_polygon.push(quadrant_c[quadrant_c_sin.indexOf(sin)]))
                                if (quadrant_d) [...quadrant_d_sin].sort((a, b) => a - b).forEach(sin => intersection_polygon.push(quadrant_d[quadrant_d_sin.indexOf(sin)]))


                                intersection_polygon.forEach((v, i) => _intersection_line.push([v, intersection_polygon[(i + 1) % intersection_polygon.length]]));


                                // 画出交集多边形的线段 用于测试
                                // _intersection_line.forEach(v => {
                                //     _drawDebugLine(v);
                                // });


                            } else {
                                console.warn(`相交多边形的顶点个数异常${intersection_points.length}`);
                            }

                        });
                    });



                    // 去重
                    _need_update_polygons = Array.from(new Set(_need_update_polygons));
                    // 删除之前的wallgeometry
                    const delete_wall_index = _need_update_polygons.map(v => _projection2WallIndex[v]);
                    delete_wall_index.forEach(v => _wall[v] && _viewer!.scene.primitives.remove(_wall[v]) && delete _wall[v]);

                    // 生成贴图
                    const positions = await _lerp(_projection_positions, _need_update_polygons);
                    if (_this_draw_time !== _draw_time) return;

                    Object.keys(positions.old).forEach(v => {
                        const key = Number(v);
                        _wall[_projection2WallIndex[key]] = _createWellWall(positions.old[key].position, positions.old[key].min_heights, positions.old[key].max_heights);
                    })

                    _projection2BottomSurface[_projection_index] = _bottomSurfaces.push(_createBottomSurface(positions.position_bottom_surface)) - 1;
                    const create_wall_index = _wall.push(_createWellWall(positions.position, positions.min_heights, positions.max_heights)) - 1;

                    cutting_index.forEach(v => (_cutting2projection_positions[v] = _projection_index));
                    _projection2Cutting[_projection_index] = cutting_index;
                    _projection2WallIndex[_projection_index] = create_wall_index;

                    _projection2Collection[_projection_index] = _clippingPlaneCollections.push(collections) - 1;
                    resolve(_projection_index);
                }

                reject("顶点数小于3个 不满足裁剪面的定义");
            },
            ScreenSpaceEventType.LEFT_DOUBLE_CLICK
        );
    })
}

const _pointInsidePolygon = (point: Cartesian3, polygon: Cartesian3[]) => {
    // 这里如果叉乘为0 则点在多边形的顶点或者边上 这里如果结果为0直接认为在多边形外 因为后面计算两个多边形交点的时候会把该交点计算进去
    for (let i = 0; i < polygon.length; i++) {
        let next_i = (i + 1) % polygon.length;
        const i_cross = Cartesian2.cross(
            Cartesian2.subtract(new Cartesian2(polygon[next_i].x, polygon[next_i].y), new Cartesian2(polygon[i].x, polygon[i].y), new Cartesian2()),
            Cartesian2.subtract(new Cartesian2(point.x, point.y), new Cartesian2(polygon[i].x, polygon[i].y), new Cartesian2())
        );
        if (i_cross <= 0) return false;
    };
    return true;
}

const _segmentsIntersectionPoint = (a: Cartesian3, b: Cartesian3, c: Cartesian3, d: Cartesian3) => {
    const area_abc = (a.x - c.x) * (b.y - c.y) - (a.y - c.y) * (b.x - c.x);
    const area_abd = (a.x - d.x) * (b.y - d.y) - (a.y - d.y) * (b.x - d.x);
    if (area_abc * area_abd >= 0) {
        return false;
    }

    const area_cda = (c.x - a.x) * (d.y - a.y) - (c.y - a.y) * (d.x - a.x);
    // 这里可能是有问题的 面积大小是标量 叉乘结果是矢量 标量判断符号没有意义
    const area_cdb = area_cda + area_abc - area_abd;
    if (area_cda * area_cdb >= 0) {
        return false;
    }

    //计算交点坐标  
    const t = area_cda / (area_abd - area_abc);
    const dx = t * (b.x - a.x),
        dy = t * (b.y - a.y);
    return { x: a.x + dx, y: a.y + dy };
}


// 删除裁剪面
export const remove = (_projection_id: _PROJECTION_ID) => {
    if (_status == _Mode.undo) return;
    if (!_projections[_projection_id]) return;

    _clippingPlaneCollections[_projection2Collection[_projection_id]].forEach(v => _viewer!.scene.globe.multiClippingPlanes!.remove(v));
    _viewer!.scene.primitives.remove(_bottomSurfaces[_projection2BottomSurface[_projection_id]]);
    _viewer!.scene.primitives.remove(_wall[_projection2WallIndex[_projection_id]]);
    delete _projections[_projection_id];
    delete _bottomSurfaces[_projection2BottomSurface[_projection_id]];
    delete _projection2BottomSurface[_projection_id];

    delete _wall[_projection2WallIndex[_projection_id]];
    delete _projection2WallIndex[_projection_id];

    _projection2Cutting[_projection_id].forEach(v => { delete _ploygons[v]; delete _ploygons_boundingbox[v]; delete _cutting2projection_positions[v] });
    delete _projection2Cutting[_projection_id];





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

const _segmentsDifference = (lineA_min: number, lineA_max: number, lineB_min: number, lineB_max: number) => {
    // ab为线段A cd为线段B
    const min = window.Math.min(lineA_min, lineB_min);
    const max = window.Math.max(lineA_max, lineB_max);
    if (min === lineB_min && max === lineB_max) {
        // 线段B 包含 线段A
        return [];
    } else if (min === lineA_min && max === lineA_max) {
        // 线段A 包含 线段B  lineA_min - lineB_min && lineB_max - lineA_max
        // 线段A的端点可能和线段B的端点重合 所以这里需要判断一下 如果线段两个端点为同一个值则构不成线段
        const _r = [];
        lineA_min !== lineB_min && _r.push([lineA_min, lineB_min]);
        lineB_max !== lineA_max && _r.push([lineB_max, lineA_max]);
        return _r;
    } else if (min === lineA_min && max === lineB_max) {
        return [[lineA_min, lineB_min]];
    } else if (min === lineB_min && max === lineA_max) {
        return [[lineB_max, lineA_max]];
    }

    throw new Error(`${Function.name}异常`);
}

const _isSegmentsCollineation = (a: Cartesian2, b: Cartesian2, c: Cartesian2, d: Cartesian2) => {
    // ab为线段A cd为线段B 线段A为绘制的线段 线段B为交集多边形的边
    // 由于在计算过程中存在精度问题 所以这里只能近似判断取值!!!!
    if (window.Math.abs(Cartesian2.cross(Cartesian2.subtract(b, a, new Cartesian2()), Cartesian2.subtract(d, c, new Cartesian2()))) > 0.00001) return [[a, b]];
    if (window.Math.abs(Cartesian2.cross(Cartesian2.subtract(c, a, new Cartesian2()), Cartesian2.subtract(d, a, new Cartesian2()))) > 0.00001) return [[a, b]];

    const lineA_min_x = window.Math.min(a.x, b.x);
    const lineA_max_x = window.Math.max(a.x, b.x);
    const lineA_min_y = window.Math.min(a.y, b.y);
    const lineA_max_y = window.Math.max(a.y, b.y);

    const lineB_min_x = window.Math.min(c.x, d.x);
    const lineB_max_x = window.Math.max(c.x, d.x);
    const lineB_min_y = window.Math.min(c.y, d.y);
    const lineB_max_y = window.Math.max(c.y, d.y);

    if (lineA_max_x <= lineB_min_x || lineA_min_x >= lineB_max_x || lineA_max_y <= lineB_min_y || lineA_min_y >= lineB_max_y) return [[a, b]];

    const segments: Cartesian2[][] = [];
    // A B共线 计算线段A中不共线的区域
    if (a.x - b.x === 0) {
        // y轴
        const _r = _segmentsDifference(lineA_min_y, lineA_max_y, lineB_min_y, lineB_max_y)!;
        _r.forEach(
            val => {
                const segment: Cartesian2[] = [];
                val.forEach(
                    v => {
                        switch (v) {
                            case lineA_min_y: segment.push(lineA_min_y === a.y ? a : b); break;
                            case lineA_max_y: segment.push(lineA_max_y === a.y ? a : b); break;
                            case lineB_min_y: segment.push(lineB_min_y === c.y ? c : d); break;
                            case lineB_max_y: segment.push(lineB_max_y === c.y ? c : d); break;
                        }
                    }
                );
                segments.push(segment);
            }
        );
    } else if (a.y - b.y === 0) {
        // x轴
        const _r = _segmentsDifference(lineA_min_x, lineA_max_x, lineB_min_x, lineB_max_x)!;

        _r.forEach(
            val => {
                const segment: Cartesian2[] = [];
                val.forEach(
                    v => {
                        switch (v) {
                            case lineA_min_x: segment.push(lineA_min_x === a.x ? a : b); break;
                            case lineA_max_x: segment.push(lineA_max_x === a.x ? a : b); break;
                            case lineB_min_x: segment.push(lineB_min_x === c.x ? c : d); break;
                            case lineB_max_x: segment.push(lineB_max_x === c.x ? c : d); break;
                        }
                    }
                );
                segments.push(segment);
            }
        );
    } else {
        // 随意取x轴
        const _r = _segmentsDifference(lineA_min_x, lineA_max_x, lineB_min_x, lineB_max_x)!;

        _r.forEach(
            val => {
                const segment: Cartesian2[] = [];
                val.forEach(
                    v => {
                        switch (v) {
                            case lineA_min_x: segment.push(lineA_min_x === a.x ? a : b); break;
                            case lineA_max_x: segment.push(lineA_max_x === a.x ? a : b); break;
                            case lineB_min_x: segment.push(lineB_min_x === c.x ? c : d); break;
                            case lineB_max_x: segment.push(lineB_max_x === c.x ? c : d); break;
                        }
                    }
                );
                segments.push(segment);
            }
        );
    }

    return segments;
}

const _getLerpObject = (polygon: Cartesian3[], is_bottom_surface: boolean = false) => {
    const wgs84: _WGS84_POSITION[] = [];
    const position: Cartesian3[][] = [];
    const wgs84_bottom_surface: _WGS84_POSITION[] = [];

    for (let i = 0; i < polygon.length; i++) {
        // 方便底面贴图和周围墙体贴图分开计算
        let origin_car = _web_mercator.unproject(polygon[i]);
        is_bottom_surface && wgs84_bottom_surface.push({ lon: origin_car.longitude, lat: origin_car.latitude });

        const next_i = (i + 1) % polygon.length;
        let seg = [[new Cartesian2(polygon[i].x, polygon[i].y), new Cartesian2(polygon[next_i].x, polygon[next_i].y)]];
        // 计算多边形的边和所有交集多边形的边是否存在共线的情况
        for (let ii = 0; ii < _intersection_line.length; ii++) {
            const seg_backup = [...seg];
            seg = [];
            seg_backup.forEach(
                v => {
                    _isSegmentsCollineation(v[0], v[1], _intersection_line[ii][0], _intersection_line[ii][1]).forEach(vv => seg.push(vv));
                }
            );
            if (!seg) break;
        }

        if (!seg) continue;

        seg.forEach(
            vv => {
                const _p = [];
                for (let p = 0; p <= 1000; p++) {
                    let m = Math.lerp(vv[0].x, vv[1].x, p / 1000);
                    let g = Math.lerp(vv[0].y, vv[1].y, p / 1000);
                    let car = _web_mercator.unproject(new Cartesian3(m, g));

                    let f = Cartesian3.fromRadians(car.longitude, car.latitude, 0);
                    _p.push(f) && wgs84.push({ lon: car.longitude, lat: car.latitude });
                }
                position.push(_p);
            }
        );
    }
    return is_bottom_surface ? { wgs84: wgs84, position: position, wgs84_bottom_surface: wgs84_bottom_surface } : { wgs84: wgs84, position: position }
}

const _lerp = async (t: Cartesian3[], _need_update_polygons: number[]) => {
    let offset = 200;
    let min = Number.POSITIVE_INFINITY;
    const max_heights: number[][] = [];
    const min_heights: number[][] = [];
    const wgs84: _WGS84_POSITION[] = [];

    const old: { [index: number]: { position: Cartesian3[][], max_heights: number[][], min_heights: number[][] } } = {};
    // 这里重新计算与当前多边形相交的之前的多边形
    _need_update_polygons.forEach(
        v => {

            const polygon = _projections[v];
            const old_lerp_object = _getLerpObject(polygon);

            old[v] = {
                position: old_lerp_object.position,
                max_heights: [],
                min_heights: []
            };
            wgs84.push(...old_lerp_object.wgs84);
        }
    );


    // 这里以计算当前绘制的多边形为主
    const new_lerp_object = _getLerpObject(t, true);

    wgs84.push(...new_lerp_object.wgs84);

    const effective = await _ellipsoidToLonLat(wgs84);

    // 从结果中获取之前需要更新的多边形的高度
    Object.keys(old).forEach(v => {
        const key = Number(v);
        for (let i = 0; i < old[key].position.length; i++) {
            // 由于splice改变了原数组的索引 所以不需要叠加索引 都是从0开始向后截取1001个
            old[key].max_heights.push(effective.splice(0, 1001).map(v => v.height));
        }
        const min = window.Math.min(...old[key].max_heights.flat());
        old[key].position.forEach(v => old[key].min_heights.push(v.map(_ => min - offset)));
    });

    // 从结果中获取当前绘制多边形的高度
    effective.forEach(v => v.height < min && (min = v.height));
    effective.forEach((v, i) => {
        if (i !== effective.length - 1 && i % 1001 === 0) {
            max_heights[window.Math.floor(i / 1001)] = [];
            min_heights[window.Math.floor(i / 1001)] = [];
        }
        max_heights[window.Math.floor(i / 1001)].push(v.height) && min_heights[window.Math.floor(i / 1001)].push(min - offset);
    });

    return {
        position: new_lerp_object.position,
        max_heights: max_heights,
        min_heights: min_heights,
        position_bottom_surface: new_lerp_object.wgs84_bottom_surface!.map(v => { (v.height = min - offset); return v; }).map(v => Object.values(v)).flat(),
        old: old
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
    return bottomSurface;
}


const _createWellWall = function (position: Cartesian3[][], min_heights: number[][], max_heights: number[][]) {
    const geometryInstances = position.map((v, i) => new GeometryInstance(
        {
            geometry: WallGeometry.createGeometry(
                new WallGeometry({
                    positions: v,
                    maximumHeights: max_heights[i],
                    minimumHeights: min_heights[i]
                })
            )!,
            attributes: {
                color: ColorGeometryInstanceAttribute.fromColor(Color.GREY)
            },
            id: "PitWall"
        }
    ));

    const a = new Material({
        fabric: {
            type: "Image",
            uniforms: {
                image: '../file/texture/poly-stone.jpg'
            }
        }
    })
    const n = new MaterialAppearance({
        translucent: false,
        flat: true,
        material: a
    });
    const wellWall = new Primitive({
        geometryInstances: geometryInstances,
        appearance: n,
        asynchronous: false
    });
    _viewer!.scene.primitives.add(wellWall)
    return wellWall;
}

const _drawDebugLine = (v: [Cartesian2, Cartesian2]) => {
    const car0 = _web_mercator.unproject(new Cartesian3(v[0].x, v[0].y, 0));
    const car1 = _web_mercator.unproject(new Cartesian3(v[1].x, v[1].y, 0));

    let entity = new Entity({
        show: true,
        polyline: new PolylineGraphics({
            show: true,
            positions: [Cartesian3.fromRadians(car0.longitude, car0.latitude), Cartesian3.fromRadians(car1.longitude, car1.latitude)],
            width: 5,
            material: Color.GREEN
        })
    });
    _viewer!.entities.add(entity);
}