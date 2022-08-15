import { Cartesian3, Cesium3DTileStyle, createOsmBuildings, CustomShader, LightingModel, Math, TextureUniform, UniformType, VaryingType } from "cesium"

let createBuildingShader = () => {
	return new CustomShader({
		lightingModel: LightingModel.UNLIT,

		fragmentShaderText: `
			void fragmentMain(FragmentInput fsInput, inout czm_modelMaterial material) {
				float _baseHeight = 0.0; 
				float _heightRange = 60.0; 
				float _glowRange = 20.0; 
			    float vtxf_height = fsInput.attributes.positionMC.y-_baseHeight;
			    float vtxf_a11 = fract(czm_frameNumber / 120.0) * 3.14159265 * 2.0;
			    float vtxf_a12 = vtxf_height / _heightRange + sin(vtxf_a11) * 0.1;
			    material.diffuse*= vec3(0.,vtxf_a12,vtxf_a12);

			    float vtxf_a13 = fract(czm_frameNumber / 360.0);
			    vtxf_a13 = abs(vtxf_a13 - 0.5) * 2.0;

			    float vtxf_h = clamp(vtxf_height / _glowRange, 0.0, 1.0);
			    float vtxf_diff = step(0.005, abs(vtxf_h - vtxf_a13));
			    material.diffuse += material.diffuse * (1.0 - vtxf_diff);
			}	 	
			`,
	});

}

// const createBuildingShader = () => {
//   return new CustomShader({
//     lightingModel: LightingModel.UNLIT,
//     varyings: {
//       v_normalMC: VaryingType.VEC3
//     },
//     uniforms: {
//       u_texture: {
//         value: new TextureUniform({
//           url: 'file/texture/wall.png',
//         }),
//         type: UniformType.SAMPLER_2D
//       }
//     },
//     vertexShaderText: /* glsl */ `
// void vertexMain(VertexInput vsInput, inout czm_modelVertexOutput vsOutput) {
//   v_normalMC = vsInput.attributes.normalMC;
// }`,
//     fragmentShaderText: /* glsl */ `
// void fragmentMain(FragmentInput fsInput, inout czm_modelMaterial material) {
//   vec3 positionMC = fsInput.attributes.positionMC;
//   float width = 50.0;
//   float height = 5.0;
//   if (dot(vec3(0.0, 1.0, 0.0), v_normalMC) > 0.95) {
//     material.diffuse = vec3(0.079, 0.107, 0.111);

//     return;
//   } else {
//     float textureX = 0.0;
//     float dotXAxis = dot(vec3(1.0, 0.0, 0.0), v_normalMC);
//     if (dotXAxis > 0.52 || dotXAxis < -0.52) {
//         textureX = mod(positionMC.x, width) / width;
//     } else {
//         textureX = mod(positionMC.z, width) / width;
//     }
//     float textureY = mod(positionMC.y, height) / height;
//     // vec3 rgb = texture2D(u_texture, vec2(textureX, textureY)).rgb;

//     // material.diffuse = rgb;

//     if (positionMC.y > 6.66) {
//       material.diffuse = vec3(0.,1.,1.);
//     } else {
//       material.diffuse = vec3(0.,0.55,0.55);
//     }
//     // material.diffuse = vec3(0.,1.,1.) * vec3(0.,textureX,textureY);

//     return;
//   }
//   material.diffuse = vec3(0.129, 0.157, 0.161);
// }`
//   })
// }
export { createBuildingShader }