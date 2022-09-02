import {
	BoundingSphere,
	Cartesian3,
	Color,
	ColorMaterialProperty,
	ConstantProperty,
	DataSource,
	DistanceDisplayCondition,
	Ellipsoid,
	Entity,
	GeoJsonDataSource,
	HeightReference,
	HorizontalOrigin,
	JulianDate,
	Material,
	MaterialProperty,
	Math,
	Property,
	VerticalOrigin,
	Viewer,
} from 'cesium';

const _r: { data_source: DataSource; label: Entity[] }[] = [];

export const add = async (
	viewer: Viewer,
	geojson: GeoJSON.FeatureCollection,
	data?: { [index: string]: number },
	index?: string,
	factor = 100
) => {
	const data_source = await viewer.dataSources.add(
		GeoJsonDataSource.load(geojson, {
			stroke: Color.YELLOW, //设置多边形轮廓的默认颜色
			fill: Color.RED.withAlpha(0.5), //多边形的内部默认颜色
			strokeWidth: 20, //轮廓的宽度
			clampToGround: true, //让地图贴地
		})
	);

	const features: string[] = [];
	const label_entity: Entity[] = [];
	data_source.entities.values.forEach(entity => {
		if (!entity.polygon || !entity.polygon.hierarchy) return;
		// entity.polygon.height = 0;
		const color = Color.fromRandom({ alpha: 0.6 }); //随机生成一个颜色且透明度为0.6
		const material = new ColorMaterialProperty(color);
		entity.polygon.material = material as MaterialProperty; //将随机产生的颜色赋予多边形
		entity.polygon.outline = new ConstantProperty(false); //是否显示多边形的轮廓

		if (entity.name !== undefined && features.indexOf(entity.name) === -1) {
			const idx = entity.properties?.getValue(JulianDate.now())[index!];
			let value: number | undefined = undefined;
			if (data && index && idx !== undefined) {
				value = data[idx] ? data[idx] : 0;
				entity.polygon.extrudedHeight = new ConstantProperty(value * factor); //设置多边形色块的高度
			}

			const label_position = Cartesian3.fromDegrees(
				...(entity.properties
					?.getValue(JulianDate.now())
					.center.concat(value !== undefined ? value * factor + 10 : 10) as [number, number, number])
			);
			const _entity = viewer.entities.add({
				position: label_position,
				label: {
					font: '24px sans-serif',
					text: value !== undefined ? `${entity.name}(${value})` : `${entity.name}`,
					showBackground: true,
					scale: 0.6,
					verticalOrigin: VerticalOrigin.BOTTOM,
					horizontalOrigin: HorizontalOrigin.CENTER,
					heightReference: HeightReference.RELATIVE_TO_GROUND,
					backgroundColor: color,

					// distanceDisplayCondition: new DistanceDisplayCondition(10.0, 100000.0),
					// disableDepthTestDistance: 10000.0,
				},
			});

			label_entity.push(_entity);
			features.push(entity.name);
		}
	});
	return _r.push({ data_source: data_source, label: label_entity });
};

export const remove = (viewer: Viewer, index: number) => {
	if (!_r[index]) return;
	viewer.dataSources.remove(_r[index].data_source);
	_r[index].label.forEach(v => viewer.entities.remove(v));
	delete _r[index];
};
