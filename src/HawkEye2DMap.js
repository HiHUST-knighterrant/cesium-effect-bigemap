import { Cartesian2, Cartesian3, Color, SceneMode, ScreenSpaceEventHandler, ScreenSpaceEventType, UrlTemplateImageryProvider, Viewer } from "cesium";

export class HawkEye2DMap {
    constructor(viewer) {
        // 主图
        this._viewer = viewer;
        // 鹰眼图
        this._hawkEyeMap = null;
    }

    // 初始化函数
    _init() {
        this._divInit();
        this._mapInit();
    }

    // 动态创建div,及div初始化
    _divInit() {
        let hawkEyeDiv = document.createElement("div");
        hawkEyeDiv.setAttribute('id', "hawkEye2dMap");
        hawkEyeDiv.style.cssText = "position: absolute;left: 70% ;top: 2% ;border-radius: 50% ;height: 160px;width: 160px;overflow: hidden;border: 2px solid #002FA7;"
        document.getElementsByTagName("body").item(0).appendChild(hawkEyeDiv);
    };

    // 初始化地图
    _mapInit() {
            this._hawkEyeMap = new Viewer('hawkEye2dMap', {
                geocoder: false,
                homeButton: false,
                sceneModePicker: false,
                baseLayerPicker: false,
                navigationHelpButton: false,
                animation: false,
                timeline: false,
                fullscreenButton: false,
                // 鹰眼地图中设置为二维地图
                sceneMode: SceneMode.SCENE2D,
            });
            this._hawkEyeMap.cesiumWidget.creditContainer.style.display = 'none';
            this._hawkEyeMap.scene.backgroundColor = Color.TRANSPARENT;
            this._hawkEyeMap.imageryLayers.removeAll();

            // 鹰眼图中添加高德路网中文注记图（鹰眼图中坐标偏移一点不影响）
            this._hawkEyeMap.imageryLayers.addImageryProvider(
                new UrlTemplateImageryProvider({
                    url: "http://webrd02.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
                    minimumLevel: 3,
                    maximumLevel: 18
                })
            );

            // 引起事件监听的相机变化幅度
            this._viewer.camera.percentageChanged = 0.02;
            this._hawkEyeMap.camera.percentageChanged = 0.5;

            this._bindEvent();
        }
        // 绑定事件
    _bindEvent() {
        // 鹰眼与主图同步
        this._viewer.camera.changed.addEventListener(this._syncEyeMap, this);
        // 第一次刷新渲染时联动
        this._viewer.scene.preRender.addEventListener(this._syncEyeMap, this);
    }

    // 同步主图与鹰眼地图
    _syncEyeMap() {
        // 监听主图
        new ScreenSpaceEventHandler(this._viewer.canvas).setInputAction(() => {
            this._isMainMapTrigger = true;
            this._isEyeMapTrigger = false;
        }, ScreenSpaceEventType.MOUSE_MOVE);

        // 但当鹰眼图为二维地图时，则不能直接设置
        let viewCenter = new Cartesian2(
            // Math.floor取整函数
            Math.floor(this._viewer.canvas.clientWidth / 2),
            Math.floor(this._viewer.canvas.clientHeight / 2)
        );
        // pickEllipsoid用于将屏幕坐标转换为世界坐标
        let viewCenterPos = this._viewer.scene.camera.pickEllipsoid(viewCenter);
        if (!viewCenterPos) {
            return false;
        }

        // postionWC：标准世界坐标系坐标
        let distance = Cartesian3.distance(viewCenterPos, this._viewer.scene.camera.positionWC);
        this._hawkEyeMap.scene.camera.lookAt(viewCenterPos, new Cartesian3(0.0, 0.0, distance));
    }
}
