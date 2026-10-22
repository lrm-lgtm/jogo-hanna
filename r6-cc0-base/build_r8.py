#!/usr/bin/env python3
"""R8 licensed CC0 high-topology skinned avatar: teal/pink palette + backpack.
Blender pipeline, no paid resources, no personal photos transmitted. Model is a *candidate*,
not a likeness and NOT visually accepted as premium before real renderer review.
"""
import bpy, math, json
from pathlib import Path
from mathutils import Vector
from math import sin,cos,pi
DIR=Path(__file__).resolve().parent;ASSETS=DIR/'assets';OUT=ASSETS/'hanna-r8.glb'
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
bpy.ops.import_scene.gltf(filepath=str(ASSETS/'HairSample_Female.glb'))
body=bpy.data.objects.get("Body");face=bpy.data.objects.get("Face");hair=bpy.data.objects.get("Hair001")
assert body and face and hair, "VRM imported main skin meshes missing"
arm=body.find_armature()
assert arm and 'J_Bip_C_Head' in arm.data.bones, "real humanoid rig required"

def plain(name,color,roughness=.83):
 m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True
 node=m.node_tree.nodes.get("Principled BSDF")
 node.inputs["Base Color"].default_value=(*color,1)
 node.inputs["Roughness"].default_value=roughness
 node.inputs["Metallic"].default_value=0
 return m
teal=plain('HANNA_teal_cotton_tank',(.17,.55,.53))
pink=plain('HANNA_pink_tiered_skirt',(.94,.28,.48))
hair_brown=plain('HANNA_warm_chocolate_brown_hair',(.18,.064,.041),.48)
hair_highlight=plain('HANNA_chestnut_locks',(.26,.105,.060),.48)
blush=plain('HANNA_blush_and_plush',(.98,.49,.62))
cream=plain('HANNA_plush_ivory',(.95,.85,.76))
lavender=plain('HANNA_plush_lavender',(.63,.52,.78))
dark=plain('HANNA_plush_pupil',(.12,.065,.075))
white=plain('HANNA_white_embroidery',(.97,.94,.89))
body.data.materials.append(teal)
body.data.materials.append(pink)
hair.data.materials.append(hair_brown)
hair.data.materials.append(hair_highlight)
top_mat_index=next(i for i,m in enumerate(body.data.materials) if 'Tops_' in m.name)
hair_mats=[i for i,m in enumerate(hair.data.materials) if 'Hair_' in m.name]
assert len(hair_mats)>=1
bpy.context.view_layer.update() # world matrices are evaluated by dependency graph, not updated directly
zmin=min((body.matrix_world @ v.co).z for v in body.data.vertices)
zmax=max((body.matrix_world @ v.co).z for v in body.data.vertices)
height=zmax-zmin
for p in body.data.polygons:
 if p.material_index==top_mat_index:
  z=sum((body.matrix_world @ body.data.vertices[i].co).z for i in p.vertices)/len(p.vertices)
  # Model clothing is one material: distinguish upper blouse vs lower full skirt with
  # topology-grounded Z-height instead of repainting every part blindly.
  p.material_index=len(body.data.materials)-(2 if z>zmin+.54*height else 1)
for p in hair.data.polygons:
 if p.material_index in hair_mats:
  p.material_index=len(hair.data.materials)-(2 if p.index%8 else 1)

# Geometry attached to existing *bone weights* so it will move when the real rig animates.
def bind(name,obj,bone):
 obj.name=name
 obj.parent=arm
 obj.matrix_parent_inverse=arm.matrix_world.inverted()
 group=obj.vertex_groups.new(name=bone)
 group.add(list(range(len(obj.data.vertices))),1.0,'REPLACE')
 modifier=obj.modifiers.new('follow skeleton','ARMATURE');modifier.object=arm
 return obj

def ball(name,center,radii,mat,bone='J_Bip_C_UpperChest',resolution=24):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=resolution,ring_count=max(12,resolution//2),
     location=center)
 ob=bpy.context.object;ob.scale=radii;ob.data.materials.append(mat)
 for poly in ob.data.polygons:poly.use_smooth=True
 # Apply scale but keep real-world position for bind.
 bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 return bind(name,ob,bone)
def curve(name,pts,r,mat,bone='J_Bip_C_UpperChest',rad=None):
 data=bpy.data.curves.new(name,'CURVE');data.dimensions='3D';data.resolution_u=12
 data.bevel_depth=r;data.bevel_resolution=3
 spline=data.splines.new('BEZIER');spline.bezier_points.add(len(pts)-1)
 for i,vec in enumerate(pts):
  p=spline.bezier_points[i];p.co=vec;p.handle_left_type=p.handle_right_type='AUTO'
  if rad:p.radius=rad[i]
 obj=bpy.data.objects.new(name,data);bpy.context.collection.objects.link(obj)
 obj.data.materials.append(mat)
 bpy.ops.object.select_all(action='DESELECT')
 bpy.context.view_layer.objects.active=obj;obj.select_set(True)
 bpy.ops.object.convert(target='MESH')
 return bind(name,bpy.context.object,bone)

# The model is an adult/teen rigged mannequin. Keep baseline model geometry and adapt
# accessories/visual palette as a technical feasibility candidate.
fcoords=[face.matrix_world @ v.co for v in face.data.vertices]
fc=Vector([sum(v[i] for v in fcoords)/len(fcoords) for i in range(3)])
maxhead=max(v.z for v in fcoords)
fminY=min(v.y for v in fcoords)
bcoords=[body.matrix_world @ v.co for v in body.data.vertices]
body_front=min(v.y for v in bcoords)
shoulder_z=zmin+.77*height
# Signature pink bow close to ponytail at head crown.
bow_z=maxhead+.06;bowY=fminY+.045
for side in (-1,1):
 ball('HANNA_Hairbow_loop_'+str(side),(fc.x+side*.10,bowY,bow_z),
     (.085,.026,.053),blush,bone='J_Bip_C_Head')
curve('HANNA_Hairbow_center',[(fc.x,bowY-.015,bow_z+.025),(fc.x,bowY-.025,bow_z-.02)],.020,pink,'J_Bip_C_Head')
# Decorative chest flowers on imported high-topology cloth.
for i,(x,z) in enumerate([(-.09,zmin+.72*height),(.075,zmin+.70*height),(0,zmin+.66*height)]):
 for j in range(5):
  a=2*pi*j/5
  ball('HANNA_shirt_daisy_%s_%s'%(i,j),(x+.025*cos(a),fminY-.10,z+.025*sin(a)),
      (.018,.008,.018),white)
 ball('HANNA_shirt_flower_core_%s'%i,(x,fminY-.113,z),
      (.012,.010,.012),blush)
# Fluffy pastel octopus backpack near rear upper torso, skinned to upper chest.
backpack_y=body_front-.075
backpack_z=zmin+.64*height
ball('HANNA_POLVO_plush_head',(0,backpack_y,backpack_z),
     (.18,.155,.175),lavender)
ball('HANNA_POLVO_cream_face',(0,backpack_y-.130,backpack_z+.008),
     (.139,.035,.092),cream)
for side in (-1,1):
 ball('HANNA_POLVO_eye_'+str(side),(side*.071,backpack_y-.167,backpack_z+.045),
      (.031,.011,.035),dark)
 ball('HANNA_POLVO_blush_'+str(side),(side*.104,backpack_y-.166,backpack_z-.029),
      (.029,.008,.015),blush)
for i in range(8):
 a=i*2*pi/8;x=.116*cos(a);y=backpack_y-.080*sin(a)
 curve('HANNA_POLVO_tentacle_%d'%i,
       [(x,y,backpack_z-.080),(x*1.27,y-.02,backpack_z-.22),(x*1.10,y,backpack_z-.31)],
       .040,[blush,cream,lavender][i%3],rad=[.9,1,.15])
# R8 relaxed idle pose with imported humanoid skeleton (not an animation clip).
for key,value in [('J_Bip_L_UpperArm',.98),('J_Bip_R_UpperArm',-.98)]:
    bone=arm.pose.bones.get(key)
    if bone:
        bone.rotation_mode='XYZ'
        bone.rotation_euler[0]=value
bpy.context.view_layer.update()

# The imported skinned mesh and constraints are preserved, not flattened into a T-pose image.
bpy.ops.object.select_all(action='DESELECT')
for o in bpy.data.objects:
 if o.type in ('MESH','ARMATURE','EMPTY'):o.select_set(True)
bpy.context.view_layer.objects.active=arm
bpy.ops.export_scene.gltf(filepath=str(OUT),export_format='GLB',use_selection=True,
    export_yup=True,export_animations=True,export_materials='EXPORT',export_apply=False)
assert OUT.stat().st_size>1000000
doc={'base':'HairSample_Female CC0 pinned upstream from VRoid',
     'license':'CC0 sample per VRoid official docs',
     'model':'Hanna R8 candidate based on high-poly rigged sample',
     'hair_materials':len(hair_mats),'bones':len(arm.data.bones),
     'meshes':sum(o.type=='MESH' for o in bpy.data.objects),
     'output_bytes':OUT.stat().st_size,
     'limitations':'Imported full-sleeve silhouette, generic anime face; not a match to the approved Hanna sheet. Visual must be checked before adoption.'}
(DIR/'r8-manifest.json').write_text(json.dumps(doc,indent=2,ensure_ascii=False))
print('R8_CUSTOMIZED_MODEL_OK',json.dumps(doc,ensure_ascii=False))
