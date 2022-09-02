import { Cartesian3, Color, Entity, HeightReference, Viewer } from 'cesium';

let entities: Entity[] = [];

export const add = (viewer: Viewer, polygon_lon_lat: [number, number][], is_wall = true) => {
    remove(viewer);
	const positions: number[] = [];
	let min_lon = Number.POSITIVE_INFINITY,
		min_lat = Number.POSITIVE_INFINITY,
		max_lon = Number.NEGATIVE_INFINITY,
		max_lat = Number.NEGATIVE_INFINITY;
	polygon_lon_lat.forEach(v => {
		positions.push(v[0]);
		min_lon = Math.min(v[0], min_lon);
		max_lon = Math.max(v[0], max_lon);
		positions.push(v[1]);
		min_lat = Math.min(v[1], min_lat);
		max_lat = Math.max(v[1], max_lat);
	});

	min_lat -= 10;
	max_lat += 10;
	min_lon -= 10;
	max_lon += 10;
	// 遮罩
	let polygonEntity = new Entity({
		polygon: {
			hierarchy: {
				// 添加外部区域为1/4半圆，设置为180会报错
				// positions: Cartesian3.fromDegreesArray([0, 0, 0, 90, 180, 45, 179, 0]),
				positions: Cartesian3.fromDegreesArray([
					min_lon,
					min_lat,
					min_lon,
					max_lat,
					max_lon,
					max_lat,
					max_lon,
					min_lat,
				]),
				// 中心挖空的“洞”
				holes: [
					{
						positions: Cartesian3.fromDegreesArray(positions),
						holes: [],
					},
				],
			},
			material: new Color(15 / 255.0, 38 / 255.0, 84 / 255.0, 0.7),
			heightReference: HeightReference.CLAMP_TO_GROUND,
		},
	});

	// 边界线/边界墙
	const maskspoint = Cartesian3.fromDegreesArray(positions);
	let lineEntity: Entity;
	if (is_wall) {
		lineEntity = new Entity({
			wall: {
				positions: maskspoint,
				maximumHeights: maskspoint.map(_ => {
					return 600;
				}),
				minimumHeights: maskspoint.map(_ => {
					return -600;
				}),
				material: Color.fromCssColorString('#6dcdeb'),
			},
		});
	} else {
		lineEntity = new Entity({
			polyline: {
				positions: maskspoint,
				width: 5,
				material: Color.YELLOW,
			},
		});
	}

	viewer.entities.add(polygonEntity);
	viewer.entities.add(lineEntity);
	entities.push(polygonEntity, lineEntity);
};

export const remove = (viewer: Viewer) => {
	entities.forEach(v => viewer.entities.remove(v));
    entities = [];
};
