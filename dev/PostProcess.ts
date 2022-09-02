import { PostProcessStageLibrary, Viewer } from 'cesium';

const _night_vision_stage = PostProcessStageLibrary.createNightVisionStage();
const _bloom_stage = PostProcessStageLibrary.createLensFlareStage();
export const enableNightVision = (viewer: Viewer) => {
	viewer.scene.postProcessStages.add(_night_vision_stage);
};

export const unableNightVision = (viewer: Viewer) => {
	viewer.scene.postProcessStages.remove(_night_vision_stage);
};

export const enableBloom = (viewer: Viewer) => {
	viewer.scene.postProcessStages.add(_bloom_stage);
};
