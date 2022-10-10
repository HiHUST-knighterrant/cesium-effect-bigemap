declare global {
	interface Window {
		CESIUM_BASE_URL: string;
	}
}
window.CESIUM_BASE_URL = './node_modules/cesium/Source/';
// window.CESIUM_BASE_URL = 'http://localhost:3000/dist/cesium/Source/';
import 'cesium/Build/Cesium/Widgets/widgets.css';

import { example as exampleRoadWay } from './Example/road-way';
import { example as exampleElectricArc } from './Example/electric-arc';
import { example as examplePostProcess } from './Example/post-process';
import { example as exampleSkyBox } from './Example/sky-box';
import { example as exampleSpaceLine } from './Example/space-line';
import { example as exampleTemperatrue } from './Example/temperatrue';
import { example as exampleTilesBuildingTexture } from './Example/tiles-building-texture';
// import { example as exampleClippingPlane } from './Example/clipping-plane';

import { GUI } from 'dat.gui';
const gui = new GUI();

// import 'cesium/Build/Cesium';
import {
	// ExperimentalFeatures,
	CameraEventType,
	Cartesian3,
	Cartographic,
	Color,
	createWorldTerrain,
	Ellipsoid,
	EllipsoidGeodesic,
	EventHelper,
	HeadingPitchRoll,
	ImageMaterialProperty,
	Ion,
	Math,
	Matrix4,
	PostProcessStageLibrary,
	Rectangle,
	StripeMaterialProperty,
	Transforms,
	UrlTemplateImageryProvider,
	Viewer,
} from 'cesium';
import { Draw2DMeshPloygons } from './test';

import { Trangles } from './test2';

const datas1 = () => {
	/**
	 * http://gaode.com)
	 */
	return [
		{
			x: 116.191031,
			y: 39.988585,
			value: 10,
		},
		{
			x: 116.389275,
			y: 39.925818,
			value: 11,
		},
		{
			x: 116.287444,
			y: 39.810742,
			value: 12,
		},
		{
			x: 116.481707,
			y: 39.940089,
			value: 13,
		},
		{
			x: 116.410588,
			y: 39.880172,
			value: 14,
		},
		{
			x: 116.394816,
			y: 39.91181,
			value: 15,
		},
		{
			x: 116.416002,
			y: 39.952917,
			value: 16,
		},
		{
			x: 116.39671,
			y: 39.924903,
			value: 17,
		},
		{
			x: 116.180816,
			y: 39.957553,
			value: 18,
		},
		{
			x: 116.382035,
			y: 39.874114,
			value: 19,
		},
		{
			x: 116.316648,
			y: 39.914529,
			value: 20,
		},
		{
			x: 116.395803,
			y: 39.908556,
			value: 21,
		},
		{
			x: 116.74553,
			y: 39.875916,
			value: 22,
		},
		{
			x: 116.352289,
			y: 39.916475,
			value: 23,
		},
		{
			x: 116.441548,
			y: 39.878262,
			value: 24,
		},
		{
			x: 116.318947,
			y: 39.942735,
			value: 25,
		},
		{
			x: 116.382585,
			y: 39.941949,
			value: 26,
		},
		{
			x: 116.42042,
			y: 39.884017,
			value: 27,
		},
		{
			x: 116.31744,
			y: 39.892561,
			value: 28,
		},
		{
			x: 116.407059,
			y: 39.912438,
			value: 29,
		},
		{
			x: 116.412351,
			y: 39.888082,
			value: 30,
		},
		{
			x: 116.444341,
			y: 39.915891,
			value: 31,
		},
		{
			x: 116.335385,
			y: 39.741756,
			value: 32,
		},
		{
			x: 116.3926,
			y: 40.008733,
			value: 33,
		},
		{
			x: 116.389731,
			y: 39.92292,
			value: 34,
		},
		{
			x: 116.413371,
			y: 39.874483,
			value: 35,
		},
		{
			x: 116.199752,
			y: 39.911717,
			value: 36,
		},
		{
			x: 116.278472,
			y: 40.254994,
			value: 37,
		},
		{
			x: 116.464252,
			y: 39.925828,
			value: 38,
		},
		{
			x: 116.479475,
			y: 39.937945,
			value: 39,
		},
		{
			x: 116.415599,
			y: 39.956902,
			value: 40,
		},
		{
			x: 116.355675,
			y: 39.870089,
			value: 41,
		},
		{
			x: 116.295267,
			y: 39.987171,
			value: 42,
		},
		{
			x: 116.323634,
			y: 39.911692,
			value: 43,
		},
		{
			x: 116.692769,
			y: 40.173307,
			value: 44,
		},
		{
			x: 116.287888,
			y: 39.928531,
			value: 45,
		},
		{
			x: 116.386502,
			y: 39.922747,
			value: 46,
		},
		{
			x: 116.236773,
			y: 40.218341,
			value: 47,
		},
		{
			x: 116.490636,
			y: 39.804253,
			value: 48,
		},
		{
			x: 116.391095,
			y: 39.925791,
			value: 49,
		},
		{
			x: 116.472402,
			y: 39.769178,
			value: 50,
		},
		{
			x: 116.38657,
			y: 39.956731,
			value: 51,
		},
		{
			x: 116.427536,
			y: 39.943671,
			value: 52,
		},
		{
			x: 116.374547,
			y: 39.967588,
			value: 53,
		},
		{
			x: 116.380383,
			y: 39.871634,
			value: 54,
		},
		{
			x: 116.376092,
			y: 39.965485,
			value: 55,
		},
		{
			x: 116.352424,
			y: 39.91811,
			value: 56,
		},
		{
			x: 116.020157,
			y: 40.348526,
			value: 57,
		},
		{
			x: 116.416201,
			y: 39.951736,
			value: 58,
		},
		{
			x: 116.405392,
			y: 39.908738,
			value: 59,
		},
		{
			x: 116.49238,
			y: 39.926248,
			value: 60,
		},
		{
			x: 116.389282,
			y: 39.988391,
			value: 61,
		},
		{
			x: 116.396683,
			y: 39.923487,
			value: 62,
		},
		{
			x: 116.41718,
			y: 39.905213,
			value: 63,
		},
		{
			x: 116.321512,
			y: 39.913192,
			value: 64,
		},
		{
			x: 116.260028,
			y: 40.03353,
			value: 65,
		},
		{
			x: 116.394846,
			y: 39.911168,
			value: 66,
		},
		{
			x: 116.374767,
			y: 39.96608,
			value: 67,
		},
		{
			x: 116.6841,
			y: 39.909762,
			value: 68,
		},
		{
			x: 116.3838,
			y: 39.95811,
			value: 69,
		},
		{
			x: 116.39243,
			y: 40.01143,
			value: 70,
		},
		{
			x: 116.661912,
			y: 40.121137,
			value: 71,
		},
		{
			x: 116.333056,
			y: 39.90123,
			value: 72,
		},
		{
			x: 116.484839,
			y: 39.881729,
			value: 73,
		},
		{
			x: 116.360923,
			y: 39.935745,
			value: 74,
		},
		{
			x: 116.408531,
			y: 39.953194,
			value: 75,
		},
		{
			x: 116.417916,
			y: 39.954029,
			value: 76,
		},
		{
			x: 116.412215,
			y: 39.992282,
			value: 77,
		},
		{
			x: 116.181532,
			y: 40.048762,
			value: 78,
		},
		{
			x: 116.434848,
			y: 40.070463,
			value: 79,
		},
		{
			x: 116.385039,
			y: 39.956937,
			value: 80,
		},
		{
			x: 116.755067,
			y: 39.854499,
			value: 81,
		},
		{
			x: 116.396061,
			y: 39.912841,
			value: 82,
		},
		{
			x: 116.474303,
			y: 39.971398,
			value: 83,
		},
		{
			x: 116.376262,
			y: 39.85811,
			value: 84,
		},
		{
			x: 116.403783,
			y: 39.954469,
			value: 85,
		},
		{
			x: 116.339136,
			y: 39.729159,
			value: 86,
		},
		{
			x: 116.240159,
			y: 39.947003,
			value: 87,
		},
		{
			x: 117.107541,
			y: 40.141457,
			value: 88,
		},
		{
			x: 116.341813,
			y: 40.078786,
			value: 89,
		},
		{
			x: 116.320648,
			y: 39.706455,
			value: 90,
		},
		{
			x: 116.402566,
			y: 39.960873,
			value: 91,
		},
		{
			x: 116.849261,
			y: 40.402999,
			value: 92,
		},
		{
			x: 116.521064,
			y: 39.834187,
			value: 93,
		},
		{
			x: 116.329942,
			y: 39.925327,
			value: 94,
		},
		{
			x: 116.479852,
			y: 39.974856,
			value: 95,
		},
		{
			x: 116.399185,
			y: 39.925736,
			value: 96,
		},
		{
			x: 116.193166,
			y: 39.911953,
			value: 1,
		},
		{
			x: 116.400916,
			y: 39.870614,
			value: 2,
		},
		{
			x: 116.518041,
			y: 39.956615,
			value: 3,
		},
		{
			x: 116.388981,
			y: 39.997716,
			value: 4,
		},
		{
			x: 116.285852,
			y: 39.863497,
			value: 5,
		},
		{
			x: 116.294167,
			y: 39.884599,
			value: 6,
		},
		{
			x: 116.394235,
			y: 39.996845,
			value: 7,
		},
		{
			x: 116.32471,
			y: 39.970486,
			value: 8,
		},
		{
			x: 116.496828,
			y: 39.99335,
			value: 9,
		},
		{
			x: 116.482534,
			y: 39.934086,
			value: 10,
		},
		{
			x: 116.454662,
			y: 39.974981,
			value: 11,
		},
		{
			x: 116.387076,
			y: 39.87631,
			value: 12,
		},
		{
			x: 116.433341,
			y: 39.92803,
			value: 13,
		},
		{
			x: 116.382196,
			y: 39.941606,
			value: 14,
		},
		{
			x: 116.244286,
			y: 39.82905,
			value: 15,
		},
		{
			x: 116.566672,
			y: 40.176097,
			value: 16,
		},
		{
			x: 116.686862,
			y: 39.908507,
			value: 17,
		},
		{
			x: 117.240166,
			y: 40.175796,
			value: 18,
		},
		{
			x: 116.428661,
			y: 39.866958,
			value: 19,
		},
		{
			x: 116.443292,
			y: 39.917447,
			value: 20,
		},
		{
			x: 116.356538,
			y: 39.926711,
			value: 21,
		},
		{
			x: 116.194086,
			y: 39.912242,
			value: 22,
		},
		{
			x: 116.379861,
			y: 39.971831,
			value: 23,
		},
		{
			x: 116.377966,
			y: 39.874647,
			value: 24,
		},
		{
			x: 116.466778,
			y: 39.926304,
			value: 25,
		},
		{
			x: 116.692078,
			y: 40.170197,
			value: 26,
		},
		{
			x: 116.428651,
			y: 39.94275,
			value: 27,
		},
		{
			x: 116.322655,
			y: 39.939517,
			value: 28,
		},
		{
			x: 116.445601,
			y: 39.98439,
			value: 29,
		},
		{
			x: 116.662833,
			y: 39.912238,
			value: 30,
		},
		{
			x: 116.394183,
			y: 39.925557,
			value: 31,
		},
		{
			x: 116.312788,
			y: 39.860017,
			value: 32,
		},
		{
			x: 116.104708,
			y: 40.065563,
			value: 33,
		},
		{
			x: 116.204443,
			y: 39.938295,
			value: 34,
		},
		{
			x: 116.310917,
			y: 39.89381,
			value: 35,
		},
		{
			x: 116.265851,
			y: 39.834247,
			value: 36,
		},
		{
			x: 116.33501,
			y: 39.742507,
			value: 37,
		},
		{
			x: 116.397519,
			y: 39.99794,
			value: 38,
		},
		{
			x: 116.441252,
			y: 39.915566,
			value: 39,
		},
		{
			x: 116.441898,
			y: 39.856454,
			value: 40,
		},
		{
			x: 116.446552,
			y: 39.946418,
			value: 41,
		},
		{
			x: 116.359761,
			y: 39.895327,
			value: 42,
		},
		{
			x: 116.349168,
			y: 39.893551,
			value: 43,
		},
		{
			x: 116.476819,
			y: 39.94388,
			value: 44,
		},
		{
			x: 116.29912,
			y: 39.988433,
			value: 45,
		},
		{
			x: 116.467912,
			y: 39.770524,
			value: 46,
		},
		{
			x: 116.382134,
			y: 39.862204,
			value: 47,
		},
		{
			x: 116.483378,
			y: 39.93431,
			value: 48,
		},
		{
			x: 116.35395,
			y: 39.910738,
			value: 49,
		},
		{
			x: 116.398771,
			y: 39.976433,
			value: 50,
		},
		{
			x: 116.462189,
			y: 39.925864,
			value: 51,
		},
		{
			x: 116.378957,
			y: 39.806676,
			value: 52,
		},
		{
			x: 116.334199,
			y: 39.900985,
			value: 53,
		},
		{
			x: 116.443961,
			y: 39.913511,
			value: 54,
		},
		{
			x: 116.388829,
			y: 39.95053,
			value: 55,
		},
		{
			x: 116.319655,
			y: 39.892339,
			value: 56,
		},
		{
			x: 117.431959,
			y: 40.630521,
			value: 57,
		},
		{
			x: 117.108914,
			y: 40.140406,
			value: 58,
		},
		{
			x: 116.43019,
			y: 39.880486,
			value: 59,
		},
		{
			x: 116.250698,
			y: 39.907186,
			value: 60,
		},
		{
			x: 116.341065,
			y: 39.766082,
			value: 61,
		},
		{
			x: 116.290335,
			y: 39.812431,
			value: 62,
		},
		{
			x: 116.360813,
			y: 39.936362,
			value: 63,
		},
		{
			x: 116.400282,
			y: 39.995027,
			value: 64,
		},
		{
			x: 116.317257,
			y: 39.889092,
			value: 65,
		},
		{
			x: 116.482537,
			y: 39.954978,
			value: 66,
		},
		{
			x: 116.38496,
			y: 39.954428,
			value: 67,
		},
		{
			x: 116.391803,
			y: 39.911587,
			value: 68,
		},
		{
			x: 116.4266,
			y: 39.867228,
			value: 69,
		},
		{
			x: 116.145997,
			y: 39.790856,
			value: 70,
		},
		{
			x: 116.430265,
			y: 39.867451,
			value: 71,
		},
		{
			x: 116.315479,
			y: 39.940668,
			value: 72,
		},
		{
			x: 116.359393,
			y: 39.975431,
			value: 73,
		},
		{
			x: 116.382347,
			y: 39.968935,
			value: 74,
		},
		{
			x: 115.987169,
			y: 40.454625,
			value: 75,
		},
		{
			x: 116.489292,
			y: 39.931242,
			value: 76,
		},
		{
			x: 116.368238,
			y: 39.879807,
			value: 77,
		},
		{
			x: 116.493761,
			y: 39.923885,
			value: 78,
		},
		{
			x: 116.53666,
			y: 39.8778,
			value: 79,
		},
		{
			x: 116.501743,
			y: 39.79602,
			value: 80,
		},
		{
			x: 116.582818,
			y: 39.932646,
			value: 81,
		},
		{
			x: 116.417364,
			y: 39.869292,
			value: 82,
		},
		{
			x: 116.354305,
			y: 39.872022,
			value: 83,
		},
		{
			x: 116.375162,
			y: 40.01344,
			value: 84,
		},
		{
			x: 116.400523,
			y: 39.881031,
			value: 85,
		},
		{
			x: 116.315365,
			y: 39.945005,
			value: 86,
		},
		{
			x: 116.44088,
			y: 39.810753,
			value: 87,
		},
		{
			x: 116.679285,
			y: 39.916527,
			value: 88,
		},
		{
			x: 116.483694,
			y: 39.946929,
			value: 89,
		},
		{
			x: 116.341678,
			y: 40.080021,
			value: 90,
		},
		{
			x: 116.017167,
			y: 39.889175,
			value: 91,
		},
		{
			x: 116.454692,
			y: 39.954167,
			value: 92,
		},
		{
			x: 116.410129,
			y: 40.050952,
			value: 93,
		},
		{
			x: 116.418556,
			y: 39.872365,
			value: 94,
		},
		{
			x: 116.25432,
			y: 40.142367,
			value: 95,
		},
		{
			x: 116.658763,
			y: 39.891072,
			value: 96,
		},
		{
			x: 116.305312,
			y: 39.9953,
			value: 97,
		},
		{
			x: 116.388761,
			y: 39.951259,
			value: 98,
		},
		{
			x: 116.68017,
			y: 39.873413,
			value: 99,
		},
		{
			x: 116.090539,
			y: 39.796301,
			value: 1,
		},
		{
			x: 116.380305,
			y: 39.78354,
			value: 2,
		},
		{
			x: 116.348831,
			y: 40.022543,
			value: 3,
		},
		{
			x: 116.438133,
			y: 39.960988,
			value: 4,
		},
		{
			x: 116.199587,
			y: 39.911,
			value: 5,
		},
		{
			x: 116.081743,
			y: 39.788321,
			value: 6,
		},
		{
			x: 117.24044,
			y: 40.1752,
			value: 7,
		},
		{
			x: 116.636141,
			y: 40.327724,
			value: 8,
		},
		{
			x: 116.453166,
			y: 39.973511,
			value: 9,
		},
		{
			x: 116.583381,
			y: 39.953315,
			value: 10,
		},
		{
			x: 116.236326,
			y: 39.90595,
			value: 11,
		},
		{
			x: 116.328305,
			y: 39.781647,
			value: 12,
		},
		{
			x: 116.260012,
			y: 39.984951,
			value: 13,
		},
		{
			x: 116.254938,
			y: 39.916206,
			value: 14,
		},
		{
			x: 116.85469,
			y: 40.474419,
			value: 15,
		},
		{
			x: 116.309389,
			y: 39.971918,
			value: 16,
		},
		{
			x: 116.310732,
			y: 39.971517,
			value: 17,
		},
		{
			x: 116.401885,
			y: 39.847641,
			value: 18,
		},
		{
			x: 116.427771,
			y: 39.880572,
			value: 19,
		},
		{
			x: 116.430537,
			y: 39.880968,
			value: 20,
		},
		{
			x: 116.550673,
			y: 39.895212,
			value: 21,
		},
		{
			x: 116.345906,
			y: 39.815152,
			value: 22,
		},
		{
			x: 116.512016,
			y: 39.868573,
			value: 23,
		},
		{
			x: 115.894604,
			y: 39.803644,
			value: 24,
		},
		{
			x: 116.32497,
			y: 40.083198,
			value: 25,
		},
		{
			x: 116.315523,
			y: 39.858242,
			value: 26,
		},
		{
			x: 116.465052,
			y: 39.903055,
			value: 27,
		},
		{
			x: 116.464814,
			y: 39.924176,
			value: 28,
		},
		{
			x: 115.959538,
			y: 39.727218,
			value: 29,
		},
		{
			x: 116.478895,
			y: 39.954472,
			value: 30,
		},
		{
			x: 116.337546,
			y: 39.741337,
			value: 31,
		},
		{
			x: 116.504757,
			y: 39.83778,
			value: 32,
		},
		{
			x: 116.393143,
			y: 40.02725,
			value: 33,
		},
		{
			x: 116.23419,
			y: 40.217361,
			value: 34,
		},
		{
			x: 116.368688,
			y: 39.829561,
			value: 35,
		},
		{
			x: 116.460134,
			y: 39.983721,
			value: 36,
		},
		{
			x: 116.381539,
			y: 39.746766,
			value: 37,
		},
		{
			x: 116.291759,
			y: 39.983886,
			value: 38,
		},
		{
			x: 116.377613,
			y: 39.817895,
			value: 39,
		},
		{
			x: 116.306646,
			y: 39.956296,
			value: 40,
		},
		{
			x: 116.160747,
			y: 39.818863,
			value: 41,
		},
		{
			x: 116.392912,
			y: 40.001989,
			value: 42,
		},
		{
			x: 116.199115,
			y: 39.91276,
			value: 43,
		},
		{
			x: 116.434577,
			y: 39.812232,
			value: 44,
		},
		{
			x: 116.495843,
			y: 39.925538,
			value: 45,
		},
		{
			x: 116.333803,
			y: 39.913224,
			value: 46,
		},
		{
			x: 116.489277,
			y: 39.941842,
			value: 47,
		},
		{
			x: 116.510514,
			y: 39.973547,
			value: 48,
		},
		{
			x: 116.474685,
			y: 39.936648,
			value: 49,
		},
		{
			x: 116.418054,
			y: 39.905091,
			value: 50,
		},
		{
			x: 116.285529,
			y: 39.926274,
			value: 51,
		},
		{
			x: 116.289399,
			y: 39.948054,
			value: 52,
		},
		{
			x: 116.508241,
			y: 39.920234,
			value: 53,
		},
		{
			x: 116.317979,
			y: 40.000721,
			value: 54,
		},
		{
			x: 116.428324,
			y: 39.868263,
			value: 55,
		},
		{
			x: 116.407517,
			y: 40.016715,
			value: 56,
		},
		{
			x: 116.338841,
			y: 39.969646,
			value: 57,
		},
		{
			x: 116.495703,
			y: 39.992607,
			value: 58,
		},
		{
			x: 116.369659,
			y: 39.97595,
			value: 59,
		},
		{
			x: 116.291709,
			y: 39.96228,
			value: 60,
		},
		{
			x: 116.311003,
			y: 39.998264,
			value: 61,
		},
		{
			x: 116.391429,
			y: 39.93324,
			value: 62,
		},
		{
			x: 116.406033,
			y: 39.95407,
			value: 63,
		},
		{
			x: 116.391856,
			y: 39.912004,
			value: 64,
		},
		{
			x: 116.356434,
			y: 39.871474,
			value: 65,
		},
		{
			x: 116.477081,
			y: 39.970334,
			value: 66,
		},
		{
			x: 116.475337,
			y: 39.939749,
			value: 67,
		},
		{
			x: 116.752911,
			y: 39.916369,
			value: 68,
		},
		{
			x: 116.470361,
			y: 39.874606,
			value: 69,
		},
		{
			x: 116.489172,
			y: 39.949033,
			value: 70,
		},
		{
			x: 116.502514,
			y: 39.973734,
			value: 71,
		},
		{
			x: 116.186985,
			y: 39.920185,
			value: 72,
		},
		{
			x: 116.583743,
			y: 39.95335,
			value: 73,
		},
		{
			x: 116.119183,
			y: 39.732055,
			value: 74,
		},
		{
			x: 116.391902,
			y: 39.93331,
			value: 75,
		},
		{
			x: 116.488588,
			y: 39.953371,
			value: 76,
		},
		{
			x: 116.381798,
			y: 39.975717,
			value: 77,
		},
		{
			x: 116.384689,
			y: 39.827773,
			value: 78,
		},
		{
			x: 116.445287,
			y: 39.894354,
			value: 79,
		},
		{
			x: 116.24048,
			y: 39.947687,
			value: 80,
		},
		{
			x: 116.413605,
			y: 40.04902,
			value: 81,
		},
		{
			x: 116.239012,
			y: 39.904288,
			value: 82,
		},
		{
			x: 116.408522,
			y: 40.016971,
			value: 83,
		},
		{
			x: 116.475833,
			y: 39.947107,
			value: 84,
		},
		{
			x: 116.43476,
			y: 39.901671,
			value: 85,
		},
		{
			x: 116.40229,
			y: 39.869205,
			value: 86,
		},
		{
			x: 116.226013,
			y: 40.213485,
			value: 87,
		},
		{
			x: 116.689042,
			y: 39.889192,
			value: 88,
		},
		{
			x: 116.377252,
			y: 39.873622,
			value: 89,
		},
		{
			x: 116.53061,
			y: 40.103146,
			value: 90,
		},
		{
			x: 116.416271,
			y: 39.905187,
			value: 91,
		},
		{
			x: 116.531169,
			y: 39.91276,
			value: 92,
		},
		{
			x: 116.17849,
			y: 40.075692,
			value: 93,
		},
		{
			x: 116.188616,
			y: 40.102413,
			value: 94,
		},
		{
			x: 116.531799,
			y: 39.84939,
			value: 95,
		},
		{
			x: 116.443707,
			y: 39.87558,
			value: 96,
		},
		{
			x: 116.814298,
			y: 40.53416,
			value: 97,
		},
		{
			x: 116.428247,
			y: 39.873118,
			value: 98,
		},
		{
			x: 116.290774,
			y: 39.963116,
			value: 99,
		},
		{
			x: 116.299918,
			y: 39.936094,
			value: 100,
		},
		{
			x: 116.489325,
			y: 39.944556,
			value: 101,
		},
		{
			x: 116.339297,
			y: 40.038739,
			value: 102,
		},
		{
			x: 116.485631,
			y: 39.804667,
			value: 103,
		},
		{
			x: 116.480549,
			y: 39.955012,
			value: 104,
		},
		{
			x: 116.381977,
			y: 39.878496,
			value: 1,
		},
		{
			x: 116.259586,
			y: 40.043622,
			value: 2,
		},
		{
			x: 116.587813,
			y: 40.015618,
			value: 3,
		},
		{
			x: 116.35472,
			y: 39.975865,
			value: 4,
		},
		{
			x: 116.644011,
			y: 40.299776,
			value: 5,
		},
		{
			x: 116.299449,
			y: 39.95324,
			value: 6,
		},
		{
			x: 116.332228,
			y: 39.900741,
			value: 7,
		},
		{
			x: 116.377459,
			y: 39.80869,
			value: 8,
		},
		{
			x: 116.657873,
			y: 40.120521,
			value: 9,
		},
		{
			x: 116.154466,
			y: 39.731616,
			value: 10,
		},
		{
			x: 116.845418,
			y: 40.375612,
			value: 11,
		},
		{
			x: 116.466696,
			y: 39.766475,
			value: 12,
		},
		{
			x: 116.45685,
			y: 40.011172,
			value: 13,
		},
		{
			x: 116.406651,
			y: 39.970182,
			value: 14,
		},
		{
			x: 116.428161,
			y: 39.866144,
			value: 15,
		},
		{
			x: 116.504801,
			y: 39.836822,
			value: 16,
		},
		{
			x: 116.439995,
			y: 39.81546,
			value: 17,
		},
		{
			x: 116.559057,
			y: 39.936131,
			value: 18,
		},
		{
			x: 116.225584,
			y: 39.842961,
			value: 19,
		},
		{
			x: 116.64103,
			y: 40.141812,
			value: 20,
		},
		{
			x: 116.306028,
			y: 39.860581,
			value: 21,
		},
		{
			x: 116.403426,
			y: 40.066843,
			value: 22,
		},
		{
			x: 116.399935,
			y: 40.009504,
			value: 23,
		},
		{
			x: 116.309222,
			y: 39.913107,
			value: 24,
		},
		{
			x: 116.295396,
			y: 39.784501,
			value: 25,
		},
		{
			x: 116.289673,
			y: 39.963462,
			value: 26,
		},
		{
			x: 116.445731,
			y: 40.051509,
			value: 27,
		},
		{
			x: 116.395362,
			y: 39.975426,
			value: 28,
		},
		{
			x: 116.605608,
			y: 40.0489,
			value: 29,
		},
		{
			x: 116.421157,
			y: 39.975636,
			value: 30,
		},
		{
			x: 116.452161,
			y: 39.977081,
			value: 31,
		},
		{
			x: 116.242604,
			y: 40.22134,
			value: 32,
		},
		{
			x: 116.32532,
			y: 39.970535,
			value: 33,
		},
		{
			x: 116.685587,
			y: 39.926874,
			value: 34,
		},
		{
			x: 116.39186,
			y: 39.912056,
			value: 35,
		},
		{
			x: 116.326004,
			y: 39.974148,
			value: 36,
		},
		{
			x: 116.677542,
			y: 39.892667,
			value: 37,
		},
		{
			x: 116.835958,
			y: 40.375008,
			value: 38,
		},
		{
			x: 116.484969,
			y: 39.956518,
			value: 39,
		},
		{
			x: 115.95685,
			y: 39.732297,
			value: 40,
		},
		{
			x: 116.380024,
			y: 39.872133,
			value: 41,
		},
		{
			x: 116.396477,
			y: 39.928246,
			value: 42,
		},
		{
			x: 116.390986,
			y: 39.92675,
			value: 43,
		},
		{
			x: 116.346845,
			y: 40.018932,
			value: 44,
		},
		{
			x: 116.381966,
			y: 39.970729,
			value: 45,
		},
		{
			x: 116.337349,
			y: 39.752131,
			value: 46,
		},
		{
			x: 116.494995,
			y: 39.99648,
			value: 47,
		},
		{
			x: 116.314029,
			y: 39.516896,
			value: 48,
		},
		{
			x: 116.662237,
			y: 40.122764,
			value: 49,
		},
		{
			x: 116.841367,
			y: 40.379938,
			value: 50,
		},
		{
			x: 116.365928,
			y: 39.975824,
			value: 51,
		},
		{
			x: 116.489236,
			y: 39.939992,
			value: 52,
		},
		{
			x: 116.363994,
			y: 39.852943,
			value: 53,
		},
		{
			x: 116.34283,
			y: 39.754081,
			value: 54,
		},
		{
			x: 116.361183,
			y: 39.894634,
			value: 55,
		},
		{
			x: 116.412822,
			y: 39.9769,
			value: 56,
		},
		{
			x: 116.40433,
			y: 39.97541,
			value: 57,
		},
		{
			x: 116.413478,
			y: 39.948868,
			value: 58,
		},
		{
			x: 116.406129,
			y: 39.932386,
			value: 59,
		},
		{
			x: 116.451852,
			y: 39.995137,
			value: 60,
		},
		{
			x: 116.349718,
			y: 39.870509,
			value: 61,
		},
		{
			x: 116.568628,
			y: 39.926382,
			value: 62,
		},
		{
			x: 116.643881,
			y: 40.300758,
			value: 63,
		},
		{
			x: 116.440445,
			y: 39.881325,
			value: 64,
		},
		{
			x: 116.48299,
			y: 39.869588,
			value: 65,
		},
		{
			x: 116.323732,
			y: 40.082528,
			value: 66,
		},
		{
			x: 116.257834,
			y: 39.876782,
			value: 67,
		},
		{
			x: 116.3596,
			y: 40.034545,
			value: 68,
		},
		{
			x: 116.349841,
			y: 39.875597,
			value: 69,
		},
		{
			x: 116.403928,
			y: 39.879252,
			value: 70,
		},
		{
			x: 116.42005,
			y: 39.833467,
			value: 71,
		},
		{
			x: 116.663001,
			y: 39.91046,
			value: 72,
		},
		{
			x: 116.406568,
			y: 39.908939,
			value: 73,
		},
		{
			x: 116.405188,
			y: 39.909159,
			value: 74,
		},
		{
			x: 116.415107,
			y: 39.872521,
			value: 75,
		},
		{
			x: 116.321197,
			y: 39.767552,
			value: 76,
		},
		{
			x: 116.211721,
			y: 39.688611,
			value: 77,
		},
		{
			x: 116.451346,
			y: 39.882833,
			value: 78,
		},
		{
			x: 116.557492,
			y: 39.875288,
			value: 79,
		},
		{
			x: 116.420546,
			y: 39.899053,
			value: 80,
		},
		{
			x: 116.440968,
			y: 39.898035,
			value: 81,
		},
		{
			x: 116.096699,
			y: 39.94052,
			value: 82,
		},
		{
			x: 116.410422,
			y: 39.996992,
			value: 83,
		},
		{
			x: 116.376382,
			y: 40.040343,
			value: 84,
		},
		{
			x: 116.664304,
			y: 39.912656,
			value: 85,
		},
		{
			x: 116.477188,
			y: 39.972973,
			value: 86,
		},
		{
			x: 116.400057,
			y: 39.883241,
			value: 87,
		},
		{
			x: 116.287055,
			y: 39.865057,
			value: 88,
		},
		{
			x: 116.47842,
			y: 39.975087,
			value: 89,
		},
		{
			x: 116.481061,
			y: 39.973994,
			value: 90,
		},
		{
			x: 116.428439,
			y: 39.943564,
			value: 91,
		},
		{
			x: 116.507173,
			y: 39.815616,
			value: 92,
		},
		{
			x: 116.405081,
			y: 39.959449,
			value: 93,
		},
		{
			x: 116.40121,
			y: 39.869219,
			value: 94,
		},
		{
			x: 116.437595,
			y: 39.878214,
			value: 95,
		},
		{
			x: 116.448647,
			y: 39.981149,
			value: 96,
		},
		{
			x: 116.239298,
			y: 40.218372,
			value: 97,
		},
		{
			x: 116.402223,
			y: 39.960511,
			value: 98,
		},
		{
			x: 116.664158,
			y: 40.120092,
			value: 99,
		},
		{
			x: 116.119102,
			y: 40.233172,
			value: 99,
		},
		{
			x: 116.666931,
			y: 39.917685,
			value: 100,
		},
		{
			x: 115.977448,
			y: 40.456067,
			value: 101,
		},
		{
			x: 116.355541,
			y: 39.911069,
			value: 1,
		},
		{
			x: 116.474525,
			y: 39.944593,
			value: 2,
		},
		{
			x: 116.35277,
			y: 39.910566,
			value: 3,
		},
		{
			x: 116.310743,
			y: 39.915123,
			value: 4,
		},
		{
			x: 116.384415,
			y: 39.948468,
			value: 5,
		},
		{
			x: 116.470283,
			y: 39.92274,
			value: 6,
		},
		{
			x: 116.545304,
			y: 39.632635,
			value: 7,
		},
		{
			x: 116.358194,
			y: 39.898647,
			value: 8,
		},
		{
			x: 116.311002,
			y: 39.917643,
			value: 9,
		},
		{
			x: 116.387084,
			y: 39.959407,
			value: 10,
		},
		{
			x: 116.399161,
			y: 39.972319,
			value: 11,
		},
		{
			x: 116.41415,
			y: 40.048341,
			value: 12,
		},
		{
			x: 116.283811,
			y: 39.862684,
			value: 13,
		},
		{
			x: 116.154671,
			y: 39.793723,
			value: 14,
		},
		{
			x: 116.338059,
			y: 40.034402,
			value: 15,
		},
		{
			x: 116.564921,
			y: 40.336754,
			value: 16,
		},
		{
			x: 116.396465,
			y: 39.928236,
			value: 17,
		},
		{
			x: 116.345465,
			y: 39.815134,
			value: 18,
		},
		{
			x: 117.105997,
			y: 40.140457,
			value: 19,
		},
		{
			x: 116.458762,
			y: 40.011334,
			value: 20,
		},
		{
			x: 116.330312,
			y: 39.892811,
			value: 21,
		},
		{
			x: 116.246434,
			y: 39.981835,
			value: 22,
		},
		{
			x: 116.482718,
			y: 39.967001,
			value: 23,
		},
		{
			x: 116.531887,
			y: 39.91018,
			value: 24,
		},
		{
			x: 116.303479,
			y: 40.030135,
			value: 25,
		},
		{
			x: 116.567226,
			y: 39.897282,
			value: 26,
		},
		{
			x: 116.443197,
			y: 39.810833,
			value: 27,
		},
		{
			x: 116.271062,
			y: 40.205664,
			value: 28,
		},
		{
			x: 116.430094,
			y: 39.975569,
			value: 29,
		},
		{
			x: 116.320701,
			y: 40.030695,
			value: 30,
		},
		{
			x: 116.318237,
			y: 39.945583,
			value: 31,
		},
		{
			x: 116.384177,
			y: 39.976624,
			value: 32,
		},
		{
			x: 116.609751,
			y: 39.67949,
			value: 33,
		},
		{
			x: 116.470793,
			y: 39.976487,
			value: 34,
		},
		{
			x: 116.451952,
			y: 39.994476,
			value: 35,
		},
		{
			x: 116.898355,
			y: 40.465999,
			value: 36,
		},
		{
			x: 116.324261,
			y: 39.97006,
			value: 37,
		},
		{
			x: 116.345849,
			y: 39.902789,
			value: 38,
		},
		{
			x: 116.392448,
			y: 39.949775,
			value: 39,
		},
		{
			x: 116.404969,
			y: 39.869671,
			value: 40,
		},
		{
			x: 116.391978,
			y: 39.951331,
			value: 41,
		},
		{
			x: 116.293389,
			y: 39.963228,
			value: 42,
		},
		{
			x: 116.354359,
			y: 39.871352,
			value: 43,
		},
		{
			x: 116.250473,
			y: 39.905799,
			value: 44,
		},
		{
			x: 116.529661,
			y: 39.912838,
			value: 45,
		},
		{
			x: 116.400244,
			y: 39.953832,
			value: 46,
		},
		{
			x: 116.33445,
			y: 39.790326,
			value: 47,
		},
		{
			x: 116.327622,
			y: 39.795556,
			value: 48,
		},
		{
			x: 116.394292,
			y: 39.948671,
			value: 49,
		},
		{
			x: 116.841248,
			y: 40.382222,
			value: 50,
		},
		{
			x: 116.39621,
			y: 39.912717,
			value: 51,
		},
		{
			x: 116.29526,
			y: 39.839011,
			value: 52,
		},
		{
			x: 116.390165,
			y: 39.949776,
			value: 53,
		},
		{
			x: 116.521784,
			y: 39.83616,
			value: 54,
		},
		{
			x: 116.393875,
			y: 39.996715,
			value: 55,
		},
		{
			x: 116.724049,
			y: 39.951418,
			value: 56,
		},
		{
			x: 116.434731,
			y: 39.90149,
			value: 57,
		},
		{
			x: 116.356244,
			y: 39.910916,
			value: 58,
		},
		{
			x: 116.457003,
			y: 40.008583,
			value: 59,
		},
		{
			x: 116.4954,
			y: 39.922626,
			value: 60,
		},
		{
			x: 116.451481,
			y: 39.81428,
			value: 61,
		},
		{
			x: 116.33145,
			y: 39.891865,
			value: 62,
		},
		{
			x: 116.2393,
			y: 40.236043,
			value: 63,
		},
		{
			x: 116.424888,
			y: 39.976048,
			value: 64,
		},
		{
			x: 116.336565,
			y: 39.751957,
			value: 65,
		},
		{
			x: 116.225132,
			y: 39.872326,
			value: 66,
		},
		{
			x: 116.564558,
			y: 39.886867,
			value: 67,
		},
		{
			x: 116.12651,
			y: 39.735538,
			value: 68,
		},
		{
			x: 117.008136,
			y: 40.376266,
			value: 69,
		},
		{
			x: 116.420949,
			y: 39.87321,
			value: 70,
		},
		{
			x: 115.994695,
			y: 39.701187,
			value: 71,
		},
		{
			x: 116.400738,
			y: 39.908585,
			value: 72,
		},
		{
			x: 116.424696,
			y: 39.962873,
			value: 73,
		},
		{
			x: 116.3266,
			y: 40.08181,
			value: 74,
		},
		{
			x: 116.331061,
			y: 39.892843,
			value: 75,
		},
		{
			x: 116.29248,
			y: 39.988895,
			value: 76,
		},
		{
			x: 116.466217,
			y: 39.92232,
			value: 77,
		},
		{
			x: 116.324551,
			y: 39.940216,
			value: 78,
		},
		{
			x: 116.289698,
			y: 39.815009,
			value: 79,
		},
		{
			x: 116.366762,
			y: 40.240256,
			value: 80,
		},
		{
			x: 116.331123,
			y: 39.890995,
			value: 81,
		},
		{
			x: 116.416662,
			y: 39.869136,
			value: 82,
		},
		{
			x: 116.417434,
			y: 39.833862,
			value: 83,
		},
		{
			x: 116.489063,
			y: 39.950495,
			value: 84,
		},
		{
			x: 116.425088,
			y: 39.834288,
			value: 85,
		},
		{
			x: 116.288801,
			y: 39.965264,
			value: 86,
		},
		{
			x: 116.29665,
			y: 39.805464,
			value: 87,
		},
		{
			x: 116.154403,
			y: 39.792215,
			value: 88,
		},
		{
			x: 116.320248,
			y: 39.945852,
			value: 89,
		},
		{
			x: 115.957457,
			y: 39.599769,
			value: 90,
		},
		{
			x: 116.353289,
			y: 39.915624,
			value: 91,
		},
		{
			x: 116.438992,
			y: 39.876785,
			value: 92,
		},
		{
			x: 116.10987,
			y: 39.93606,
			value: 1,
		},
		{
			x: 116.42478,
			y: 39.9665,
			value: 2,
		},
		{
			x: 116.295136,
			y: 39.927262,
			value: 3,
		},
		{
			x: 116.579446,
			y: 39.846365,
			value: 4,
		},
		{
			x: 116.507268,
			y: 39.859229,
			value: 5,
		},
		{
			x: 116.246201,
			y: 39.943989,
			value: 6,
		},
		{
			x: 116.321964,
			y: 39.767435,
			value: 7,
		},
		{
			x: 116.543317,
			y: 39.877525,
			value: 8,
		},
		{
			x: 116.402726,
			y: 39.962996,
			value: 9,
		},
		{
			x: 116.533757,
			y: 39.916293,
			value: 10,
		},
		{
			x: 116.297368,
			y: 39.936267,
			value: 11,
		},
		{
			x: 116.281225,
			y: 39.947723,
			value: 12,
		},
		{
			x: 116.651846,
			y: 40.119239,
			value: 13,
		},
		{
			x: 116.399739,
			y: 39.960987,
			value: 14,
		},
		{
			x: 116.316824,
			y: 39.862571,
			value: 15,
		},
	];
};

const datas = () => {
	var points: any[] = [];
	var max = 100;

	// 121.58, 38.91
	const lon_heatmap = 121.58;
	const lat_heatmap = 38.91;
	// 热力图经纬度范围
	var latMin = lat_heatmap;
	var latMax = lat_heatmap + 0.15;
	var lonMin = lon_heatmap;
	var lonMax = lon_heatmap + 0.2;

	// 根据热力图图片范围，生成随机热力点和强度值
	let count = 0;
	let zero = 0;
	for (var i = 0; i < 300; i++) {
		var lon1 = lonMin + window.Math.random() * (lonMax - lonMin);
		var lat1 = latMin + window.Math.random() * (latMax - latMin);
		var value = window.Math.floor(window.Math.random() * max);
		if (value !== 0) count++;
		if (count === 5 || zero !== 0) value = 0;
		if (value <= 20) value = 0;
		if (value === 0) count = 0;
		if (value === 0) zero++;
		if (zero >= 5) zero = 0;
		var point = {
			x: lon1,
			y: lat1,
			// x: window.Math.floor(((lat1 - latMin) / (latMax - latMin)) * width),
			// y: window.Math.floor(((lon1 - lonMin) / (lonMax - lonMin)) * height),
			value: value,
		};
		points.push(point);
	}
	return points;
};

Ion.defaultAccessToken =
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlN2MzMWE5ZC0wYzkyLTQ3ODMtYmJlYy1iN2QxMWI4NjU3ODUiLCJpZCI6OTMzMjYsImlhdCI6MTY1MjI1MzYyN30.irrMfifWXXSjF_wHoeyjgkmjDHZ4LBnFL4hIZf-HSGg';

const viewer = new Viewer('canvas', {
	// terrainProvider: createWorldTerrain({ requestVertexNormals: true, requestWaterMask: true }),
	animation: false, //是否显示动画控件
	baseLayerPicker: false, //是否显示图层选择控件
	geocoder: false, //是否显示地名查找控件
	timeline: false, //是否显示时间线控件
	sceneModePicker: false, //是否显示投影方式控件
	navigationHelpButton: false, //是否显示帮助信息控件
	infoBox: false, //是否显示点击要素之后显示的信息
	homeButton: false,
	shouldAnimate: true,
	scene3DOnly: true,
	imageryProvider: new UrlTemplateImageryProvider({
		// url: "http://localhost:9001/bigemap.arcgis-satellite/tiles/{z}/{x}/{y}.jpg?access_token=pk.eyJ1IjoiY3VzXzI5NW1kMnA5IiwiYSI6Ijlsa3h2NGJ1aHAxOG5ieHlqemw5ZnM0MXciLCJ0IjoxfQ.qwuFOEMOF5pJaDeSifOVJcMdq5iQI3mZVn4INsJZBD8",
		url: 'https://gac-geo.googlecnapps.cn/maps/vt?lyrs=y&gl=cn&x={x}&y={y}&z={z}',
	}),
});

viewer.scene.globe.depthTestAgainstTerrain = true;
viewer.scene.debugShowFramesPerSecond = true;
(viewer.cesiumWidget.creditContainer as HTMLElement).style.display = 'none';
// ExperimentalFeatures.enableModelExperimental = true;

if (!PostProcessStageLibrary.isSilhouetteSupported(viewer.scene)) {
	window.alert('This browser does not support the silhouette post process.');
}

// onload
viewer.scene.screenSpaceCameraController.rotateEventTypes = [CameraEventType.LEFT_DRAG];
viewer.scene.screenSpaceCameraController.tiltEventTypes = [CameraEventType.RIGHT_DRAG];
viewer.scene.screenSpaceCameraController.zoomEventTypes = [CameraEventType.WHEEL];

const helper = new EventHelper();

helper.add(viewer.scene.globe.tileLoadProgressEvent, e => {
	if (e == 0) {
		// 相机视角(平滑)移动到指定经纬度位置
		viewer.camera.flyTo({
			destination: Cartesian3.fromDegrees(121.58, 38.91, 20000), //经度、纬度、高度
			// destination: Cartesian3.fromDegrees(116.418261, 39.921984, 20000), //经度、纬度、高度

			orientation: {
				heading: 0,
				pitch: Math.toRadians(-90 || -Math.PI_OVER_FOUR),
				roll: Math.toRadians(360 || 0),
			},
			duration: 3,
			complete: () => {
				const source_points = datas();
				var temp = new Trangles({
					viewer,
					source_points: source_points,
					ifFill: true,
					height: 0,
				});
				viewer.scene.primitives.add(temp);

				const folder = gui.addFolder('三维热力图');
				const options = {
					radius: 100,
				};
				folder
					.add(options, 'radius')
					.name('热力图聚合半径')
					.min(5)
					.max(200)
					.step(0.1)
					.onChange(v => {
						temp.updateRadius(v);
					});
			},
		});

		helper.removeAll();
	}
});

exampleRoadWay(viewer, gui);
exampleElectricArc(viewer, gui);
examplePostProcess(viewer, gui);
exampleSkyBox(viewer, gui);
exampleSpaceLine(viewer, gui);
exampleTemperatrue(viewer, gui);
exampleTilesBuildingTexture(viewer, gui);
// exampleClippingPlane(viewer, gui);

/* 计算两点之间的距离 */
export const getDistance = (satrt, end) => {
	var geodesic = new EllipsoidGeodesic();
	geodesic.setEndPoints(satrt, end);
	var distance = geodesic.surfaceDistance;
	return distance;
};

const lon_length = getDistance(Cartographic.fromDegrees(121.58, 38.91), Cartographic.fromDegrees(121.68, 38.91));
const lat_length = getDistance(Cartographic.fromDegrees(121.58, 38.91), Cartographic.fromDegrees(121.58, 39.01));
console.log(lon_length, lat_length);

const offset = 50;
const lon_count = window.Math.ceil(lon_length / offset);
const lat_count = window.Math.ceil(lat_length / offset);
const links: number[][] = [];
const vertexs: number[][] = [];
const st: number[][] = [];
const values: number[] = [];
const lon = 0;
const lat = 0;
const height = 0;

const createValue = () => {
	return window.Math.random() * 1000 + window.Math.random();
};

for (let j = 0; j <= lat_count; j++) {
	for (let i = 0; i <= lon_count; i++) {
		const clon = lon + i * offset <= lon_length ? lon + i * offset : lon_length;
		const clat = lat + j * offset <= lat_length ? lat + j * offset : lat_length;
		vertexs.push([clon, clat, height]);
		values.push(createValue());
		st.push([clon / lon_length, clat / lat_length]);
	}
}

vertexs.forEach((v, i) => {
	if (v[0] === lon_length || v[1] === lat_length) return;
	links.push([i, i + 1, i + 1 + (lon_count + 1)]);
	links.push([i, i + 1 + (lon_count + 1), i + (lon_count + 1)]);
});

const options = {
	links: links.flat(),
	vertexs: vertexs.flat(),
	st: st.flat(),
};
// console.log(options);

// import h337 from 'heatmap.js';
// const heatmap = () => {
// 	var points: any[] = [];
// 	var width = 400;
// 	var height = 600;
// 	var max = 100;

// 	// 121.58, 38.91
// 	const lon_heatmap = 121.58;
// 	const lat_heatmap = 38.91;
// 	// 热力图经纬度范围
// 	var latMin = lat_heatmap;
// 	var latMax = lat_heatmap + 0.1;
// 	var lonMin = lon_heatmap;
// 	var lonMax = lon_heatmap + 0.1;
// 	// 根据热力图图片范围，生成随机热力点和强度值
// 	let count = 0;
// 	let zero = 0;
// 	for (var i = 0; i < 300; i++) {
// 		var lon1 = lonMin + window.Math.random() * (lonMax - lonMin);
// 		var lat1 = latMin + window.Math.random() * (latMax - latMin);
// 		var value = window.Math.floor(window.Math.random() * max);
// 		if (value !== 0) count++;
// 		if (count === 5 || zero !== 0) value = 0;
// 		// if (value <= 20) value = 0;
// 		if (value === 0) count = 0;
// 		if (value === 0) zero++;
// 		if (zero >= 5) zero = 0;
// 		var point = {
// 			x: window.Math.floor(((lat1 - latMin) / (latMax - latMin)) * width),
// 			y: window.Math.floor(((lon1 - lonMin) / (lonMax - lonMin)) * height),
// 			value: value,
// 		};
// 		points.push(point);
// 	}

// 	const config = {
// 		container: document.querySelector('.div-heatmap'), // 显示热力图的 dom 元素、或元素 id 名
// 		radius: 20, // 半径
// 		maxOpacity: 1, // 最大透明度 0 - 1.0
// 		minOpacity: 0, // 最小透明度 0 - 1.0
// 		// blur: 0.6, // 边缘羽化程度 0.0 - 1.0
// 	};

// 	// 创建热力图
// 	var heatmapInstance = h337.create(config);

// 	var data = {
// 		max: max,
// 		data: points,
// 	};
// 	heatmapInstance.setData(data);

// 	// 灰度图
// 	var greymap = h337.create({
// 		container: document.getElementById('greymap'),
// 		gradient: {
// 			'0': 'black',
// 			'1.0': 'white',
// 		},
// 	});

// 	greymap.setData(data);

// 	// 将热力图添加到球体上(生成的热力图canvas元素类名为heatmap-canvas)
// 	var canvas = document.getElementsByClassName('heatmap-canvas');
// 	return canvas;

// 	// viewer.entities.add({
// 	// 	name: 'heatmap',
// 	// 	rectangle: {
// 	// 		coordinates: Rectangle.fromDegrees(lonMin, latMin, lonMax, latMax),
// 	// 		material: new ImageMaterialProperty({
// 	// 			image: canvas[1] as HTMLCanvasElement,
// 	// 			transparent: true,
// 	// 		}),
// 	// 	},
// 	// });
// };

// const canvas = heatmap();
// Draw2DMeshPloygons(viewer, canvas, options, true, values);

// // viewer.zoomTo(viewer.entities);

// const defaultDataValue = [10, 500];
// const defaultOpacityValue = [0, 1];
// import { CesiumHeatmap, HeatmapPoint } from 'cesium-heatmap-es6';

// const points: HeatmapPoint[] = [];
// fetch('2016.geojson', {
// 	method: 'GET',
// 	headers: {
// 		'Content-Type': 'application/json',
// 	},
// }).then(response => {
// 	response.json().then(data => {
// 		if (data)
// 			data.features.forEach(function (feature) {
// 				const lon = feature.geometry.coordinates[0];
// 				const lat = feature.geometry.coordinates[1];
// 				points.push({
// 					x: lon - 0.05,
// 					y: lat - 0.04,
// 					value: 100 * window.Math.random(),
// 				});
// 			});
// 		const cesiumHeatmap = new CesiumHeatmap(viewer, {
// 			zoomToLayer: true,
// 			points,
// 			heatmapDataOptions: { max: defaultDataValue[1], min: defaultDataValue[0] },
// 			heatmapOptions: {
// 				maxOpacity: defaultOpacityValue[1],
// 				minOpacity: defaultOpacityValue[0],
// 			},
// 		});
// 	});
// });

//模型矩阵
// var position = Cartesian3.fromDegrees(121.58, 38.91, 0);
// var heading = Math.toRadians(0);
// var pitch = Math.toRadians(0);
// var roll = Math.toRadians(0);
// var headingPitchRoll = new HeadingPitchRoll(heading, pitch, roll);

// var modelMatrix = Transforms.headingPitchRollToFixedFrame(
// 	position,
// 	headingPitchRoll,
// 	Ellipsoid.WGS84,
// 	Transforms.eastNorthUpToFixedFrame,
// 	new Matrix4()
// );

var modelMatrix = Transforms.eastNorthUpToFixedFrame(Cartesian3.fromDegrees(121.58, 38.91, 0));
