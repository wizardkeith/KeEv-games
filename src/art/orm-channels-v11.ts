/** Web PBR must match the existing glTF ORM contract. Babylon8.32 gives the
 * default alpha flag priority over green, even if both flags are true. */
import type {PBRMaterial} from '@babylonjs/core/Materials/PBR/pbrMaterial';
export function useAuthoredORM(material:PBRMaterial){material.useRoughnessFromMetallicTextureAlpha=false;material.useRoughnessFromMetallicTextureGreen=true;material.useMetallnessFromMetallicTextureBlue=true;material.useAmbientOcclusionFromMetallicTextureRed=false;}
