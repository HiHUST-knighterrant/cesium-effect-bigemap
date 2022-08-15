import { Cartesian3, Color, Viewer } from "cesium";
import LineFlowMaterialProperty from "./LineFlowMaterialProperty";

type position = [number, number];

let spaceLine = (viewer: Viewer, position: position) => {
    // 随机竖直飞线
    lineFlowInit(viewer, position, 960);
}

/**
 * 根据圆心和半径生成园内的随机点
 * @param center 
 * @param num 
 * @param radius 
 */
function generateRandomPosition2(center: position, num: number, radius: number) {
    let positions = [];
    for (let i = 0; i < num; i++) {
        let r = Math.sqrt(Math.random()) * radius;
        let theta = Math.random() * 2 * Math.PI;
        let circle = [Math.cos(theta) * r, Math.sin(theta) * r];
        positions.push(
            [
                center[0] + circle[0],
                center[1] + circle[1]
            ]
        );
    }
    return positions;
}

/**
 * 控制变量 根据中心点和偏移量生成随机坐标
 * @param position 
 * @param num 
 * @returns 
 */
function generateRandomPosition1(position: position, num: number) {
    let list = []
    for (let i = 0; i < num; i++) {
        // random产生的随机数范围是0-1，需要加上正负模拟
        let lon = position[0] + Math.random() * 0.04 * (i % 2 == 0 ? 1 : -1);
        let lat = position[1] + Math.random() * 0.04 * (i % 2 == 0 ? 1 : -1);
        list.push([lon, lat])
    }
    return list
}

function lineFlowInit(viewer: Viewer, center: position, num: number) {
    // let _positions = generateRandomPosition1(center, num);
    let _positions = generateRandomPosition2(center, num, 0.1);
    _positions.forEach(item => {
        // 经纬度
        let start_lon = item[0];
        let start_lat = item[1];

        let startPoint = Cartesian3.fromDegrees(start_lon, start_lat, 0);

        // 随机高度
        let height = 5000 * Math.random();
        let endPoint = Cartesian3.fromDegrees(start_lon, start_lat, height);
        let linePositions = [];
        linePositions.push(startPoint);
        linePositions.push(endPoint);
        viewer.entities.add({
            polyline: {
                positions: linePositions,
                material: new LineFlowMaterialProperty({
                    color: new Color(0.0, 1.0, 0.0, 0.8),
                    speed: 15 * Math.random(),
                    percent: 0.1,
                    gradient: 0.01
                })
            }
        });
    })
}

export default spaceLine;