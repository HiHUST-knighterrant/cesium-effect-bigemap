import { Cartesian2, Cartesian3, Color, DebugModelMatrixPrimitive, HeightReference, Matrix4, Plane, ScreenSpaceEventHandler, ScreenSpaceEventType, Transforms, Viewer } from "cesium";

let viewer = new Viewer("canvas");

viewer.scene.globe.depthTestAgainstTerrain = true;

var handler = new ScreenSpaceEventHandler(viewer.canvas);

handler.setInputAction(function (event: any) {
    var clickedPoint = viewer.scene.pickPosition(event.position);

    if (!clickedPoint)
        return;

    var transform = Transforms.eastNorthUpToFixedFrame(clickedPoint);

    var inv = Matrix4.inverseTransformation(transform, new Matrix4());

    var extendedWordNormal = Cartesian3.multiplyByScalar(clickedPoint, 1.001, new Cartesian3());

    var localNormal = Matrix4.multiplyByPoint(inv, extendedWordNormal, new Cartesian3());

    //var localNormal = new Cesium.Cartesian3(0, 0, 1);

    localNormal = Cartesian3.normalize(localNormal.clone(), new Cartesian3());
    console.log(localNormal);

    viewer.scene.primitives.add(new DebugModelMatrixPrimitive({
        modelMatrix: transform,  // primitive to debug
        length: 1000000.0,
        width: 2.0
    }));

    var color = Color.fromRandom();

    viewer.entities.add({
        position: clickedPoint,
        point: {
            pixelSize: 10,
            heightReference: HeightReference.NONE,
            outlineWidth: 2,
            color: color

        },
    });

    var plane = new Plane(localNormal, 0.0);

    viewer.entities.add({
        position: clickedPoint,
        plane: {
            plane: plane,
            dimensions: new Cartesian2(1000000.0, 1000000.0),
            material: color,

        },
    });
}, ScreenSpaceEventType.LEFT_CLICK);