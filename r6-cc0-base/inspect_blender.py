#!/usr/bin/env python3
"""Read-only anatomy/material inspection of pinned VRoid CC0 model; do not transmit user photos."""
import bpy,json,os
from pathlib import Path
HERE=Path(__file__).resolve().parent
FILE=HERE/"assets"/"HairSample_Female.glb"
OUT=HERE/"inventory.json"
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
bpy.ops.import_scene.gltf(filepath=str(FILE))
objects=[]
for o in bpy.data.objects:
    if o.type=='MESH':
        objects.append({"name":o.name,"vertices":len(o.data.vertices),"polygons":len(o.data.polygons),
                        "materials":[m.name if m else "" for m in o.data.materials],
                        "dimensions":[round(float(x),4) for x in o.dimensions],
                        "has_armature":bool(o.find_armature()),
                        "shapekeys":len(o.data.shape_keys.key_blocks) if o.data.shape_keys else 0})
bones=[]
for arm in bpy.data.armatures:
    bones.extend([b.name for b in arm.bones])
materials=[{"name":m.name,"nodes":[n.name for n in m.node_tree.nodes] if m.use_nodes else []} for m in bpy.data.materials]
d={"source":"madjin/vrm-samples pinned HairSample_Female CC0","objects":objects,
   "mesh_count":len(objects),"bones":bones[:450],"bone_count":len(bones),
   "material_count":len(materials),"materials":materials[:120]}
OUT.write_text(json.dumps(d,indent=2,ensure_ascii=False))
print("R6_VROID_IMPORT_OK",d['mesh_count'],d['bone_count'],d['material_count'],str(OUT))
