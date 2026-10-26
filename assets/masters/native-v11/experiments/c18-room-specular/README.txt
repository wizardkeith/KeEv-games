Actual static room specular environment, V11 C18

This is reusable material radiance data, not a concept/game screenshot or scene
replacement. actual-static-room-specular.env is the original128px linear HDR
capture encoded in Babylon ENVv2 RGBD PNG:48mip faces, GGX64sample prefilter.
The original container is byte-identical to public/assets/native-v11 copy.
The PNG montage is ASSET inspection only, NOT a gameplay frame.

Capture point [0.10,1.48,-0.10] metres, same right-handed actual game scene;
255static meshes, no actor/owned stock/door/parcel/FX/save. Runtime applies it
only to ceramic specular, with invertZ=true and the original analytic diffuse
spherical polynomial; direct lights/nonceramic materials remain unchanged.
Native adapters must decode RGBD gamma2.2 and orient the captured cube correctly.
This is a local static approximation, not parallax-correct reflections or GI.

Authoring: build with VITE_V11_ROOM_SPECULAR_AUTHORING=1 (optional probe size
64/128 via VITE_V11_ROOM_PROBE_SIZE); tools/v11-author-room-probe.cjs uses a new
local Sandbox and writes the original HDR container/provenance. New default
builds exclude the authoring hook. VITE_V11_ROOM_SPECULAR=off is the A/B control.
Source scene meshes/material masters are preserved in native-v3 JSON/source.
GPU readback and wind phase can differ; no bit-identical GPU recapture claim.

The first SDK multi-postprocess PNG export timed out180sec. The actual asset
came from the successful CPU RGBD/2Dcanvas container encoder, using the pinned
SDK's HDR filter and public float readback. The reusable format is parsed by the
actual SDK and real WebGL loader. The old experimental installer is retained
as.txt for provenance. Technical validity is not final reference-art acceptance.
