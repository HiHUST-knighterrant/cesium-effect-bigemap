import { Color, DataSource, GeoJsonDataSource, Viewer } from 'cesium';
import { getVectorContour, drawCanvasContour } from 'kriging-contour';

export type GEOJSON_FEATURE = {
	type: 'Feature';
	properties: {
		level: number;
	};
	geometry: {
		type: 'Point';
		coordinates: [number, number];
	};
};

export type GEOJSON_FEATURECOLLECTION = {
	type: 'FeatureCollection';
	features: GEOJSON_FEATURE[];
};

export const draw = async (
	viewer: Viewer,
	dataset: { [index: string]: number }[],
	levels: [number, number, number, number, number, number, number, number, number, number, number],
	format: { lon_flag: string; lat_flag: string; value_flag: string }
) => {
	const params = {
		mapCenter: [121.58, 38.91],
		maxValue: 100,
		krigingModel: 'exponential', //'exponential','gaussian','spherical'
		krigingSigma2: 0,
		krigingAlpha: 100,
		canvasAlpha: 0.9,
		colors: [
			'#006837',
			'#1a9850',
			'#66bd63',
			'#a6d96a',
			'#d9ef8b',
			'#ffffbf',
			'#fee08b',
			'#fdae61',
			'#f46d43',
			'#d73027',
			'#a50026',
		],
	};

	// 格式化dataset格式为geojson
	const features: GEOJSON_FEATURE[] = [];
	dataset.forEach(v => {
		if (v[format.lon_flag] !== undefined && v[format.lat_flag] !== undefined && v[format.value_flag] !== undefined)
			features.push({
				type: 'Feature',
				properties: { level: v[format.value_flag] },
				geometry: { type: 'Point', coordinates: [v[format.lon_flag], v[format.lat_flag]] },
			});
	});

	if (!features) return Promise.reject(`dataset参数格式错误`);

	const geojson_dataset: GEOJSON_FEATURECOLLECTION = {
		type: 'FeatureCollection',
		features: features,
	};

	const _r = getVectorContour(
		geojson_dataset,
		'level',
		{
			model: 'exponential',
			sigma2: 0,
			alpha: 100,
		},
		levels
	);

	const promises: Promise<DataSource>[] = [];
	_r.features.forEach((v: any) => {
		const _value = v.properties.contour_value;
		const color = Color.fromCssColorString(params.colors[parseInt(_value) / 10]);
		color.alpha = 0.15;

		promises.push(
			viewer.dataSources.add(
				GeoJsonDataSource.load(v, {
					clampToGround: true,
					fill: color,
					// markerSymbol: 'park',
					// markerColor: Color.RED,
				})
			)
		);
	});

	return Promise.all(promises);
};

export const remove = (viewer: Viewer, data_sources: DataSource[]) => {
	data_sources.forEach(v => viewer.dataSources.remove(v, true));
};
