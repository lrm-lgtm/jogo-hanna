#!/usr/bin/env python3
"""Hanna 3.0: free Blender character workshop. Generates 3D GLB and real Blender renders.
No Codex, subscription, bought models or downloaded proprietary assets.
Art direction: warm chocolate hair, pink bow/hoodie, large hazel eyes, lavender flower leggings.
The model is a new, stylized *original game character*, not a likeness of a real child.
"""
import bpy, math, os, json, random
from mathutils import Vector
from math import sin, cos, pi
random.seed(15)
HERE=os.path.dirname(os.path.abspath(__file__))
OUT=os.path.join(HERE,"build")
os.makedirs(OUT,exist_ok=True)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
bpy.context.scene.frame_set(1)

def material(name,color,rough=.58,metal=0,subsurf=0):
    m=bpy.data.materials.new(name)
    m.diffuse_color=(*color,1)
    m.use_nodes=True
    p=m.node_tree.nodes.get("Principled BSDF")
    p.inputs["Base Color"].default_value=(*color,1)
    p.inputs["Roughness"].default_value=rough
    p.inputs["Metallic"].default_value=metal
    if "Subsurface Weight" in p.inputs:p.inputs["Subsurface Weight"].default_value=subsurf
    return m

SKIN=material("warm peach skin",(0.89,.60,.47),.67,subsurf=.04)
SKINLIGHT=material("gentle nose highlight",(0.98,.72,.59),.62)
BLUSH=material("rosy cheek",(0.98,.49,.51),.88)
HAIR=material("deep chocolate brown hair",(.17,.072,.042),.39)
HAIRHL=material("warm chestnut highlights",(.29,.12,.065),.44)
EYEWHITE=material("soft ivory eyes",(.99,.96,.91),.18)
IRIS=material("honey hazel iris",(.35,.18,.072),.22)
IRIS2=material("golden iris ring",(.59,.35,.12),.27)
PUPIL=material("very dark pupil",(.024,.019,.022),.08)
SPARKLE=material("eye catchlight",(1,1,.98),.06)
PINK=material("hoodie strawberry pink",(.92,.40,.54),.71)
PINKDARK=material("pink shadow piping",(.67,.20,.34),.73)
PINKLIGHT=material("powder pink shoes and bow",(1,.66,.73),.54)
WHITE=material("buttercream embroidery",(1,.92,.83),.74)
LAV=material("soft lilac leggings",(.63,.54,.84),.72)
LAVDARK=material("lilac seams",(.43,.34,.67),.66)
FLOWER=material("tiny daisy embroidery",(.99,.94,.78),.79)
GOLD=material("honey heart thread",(.92,.68,.27),.43)
DARK=material("mouth and line accents",(.21,.085,.082),.56)
SOLE=material("sneaker soft white soles",(.91,.92,.88),.77)
DENIM=material("jean pocket blue",(.36,.55,.72),.72)

all_assets=[]
def register(obj,name,m,parent=None):
    obj.name=name
    if m:obj.data.materials.clear();obj.data.materials.append(m)
    if parent:obj.parent=parent
    all_assets.append(obj)
    if obj.type=='MESH':
        for poly in obj.data.polygons:poly.use_smooth=True
    return obj

def empty(name,xyz=(0,0,0),parent=None):
    ob=bpy.data.objects.new(name,None)
    bpy.context.collection.objects.link(ob)
    ob.empty_display_type='SPHERE'
    ob.empty_display_size=.05
    if parent:ob.parent=parent
    ob.location=xyz
    all_assets.append(ob)
    return ob

root=empty("HannaRig")
head=empty("HeadPivot",(0,0,1.51),root)
leftarm=empty("ArmLeftPivot",(-.275,0,1.27),root)
rightarm=empty("ArmRightPivot",(.275,0,1.27),root)
leftleg=empty("LegLeftPivot",(-.13,0,.71),root)
rightleg=empty("LegRightPivot",(.13,0,.71),root)

def uv(name,center,scale,mat,parent=root,segments=48,rings=32):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments,ring_count=rings,location=(0,0,0))
    o=bpy.context.object;o.parent=parent;o.location=center;o.scale=scale
    return register(o,name,mat)
def cube(name,center,scale,mat,parent=root,bevel=.035):
    bpy.ops.mesh.primitive_cube_add(size=1,location=(0,0,0))
    o=bpy.context.object;o.parent=parent;o.location=center;o.scale=scale
    bpy.context.view_layer.objects.active=o
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    if bevel:
        mod=o.modifiers.new("rounded tailored edge","BEVEL");mod.width=bevel;mod.segments=3
        o.modifiers.new("weighted fabric normals","WEIGHTED_NORMAL")
    return register(o,name,mat)

def line(name,pts,thickness,mat,parent=root,radii=None):
    data=bpy.data.curves.new(name,'CURVE');data.dimensions='3D';data.resolution_u=18
    data.bevel_depth=thickness;data.bevel_resolution=3
    spline=data.splines.new('BEZIER');spline.bezier_points.add(len(pts)-1)
    for i,xyz in enumerate(pts):
        p=spline.bezier_points[i];p.co=xyz;p.handle_left_type='AUTO';p.handle_right_type='AUTO'
        p.radius=(radii[i] if radii else 1.0)
    obj=bpy.data.objects.new(name,data);bpy.context.collection.objects.link(obj)
    return register(obj,name,mat,parent)

# Rounded toddler proportions: slightly larger head, shorter arms/legs, distinct fingers and clothing.
uv("hoodie-body",(0,-.004,1.04),(.31,.233,.35),PINK)
uv("hoodie-waist-rib",(0,-.001,.77),(.298,.239,.07),PINKDARK)
uv("hoodie-hood",(0,.19,1.34),(.28,.12,.22),PINKDARK)
uv("hood-inner",(0,.253,1.375),(.205,.043,.165),PINKLIGHT)
uv("neck",(0,-.015,1.383),(.103,.085,.10),SKIN)
# Pouch pocket and kitty stitched detail.
uv("front-hoodie-pocket",(0,-.235,.94),(.175,.042,.100),PINKLIGHT)
line("pocket-top-stitch",[(-.155,-.266,.983),(0,-.288,1.003),(.155,-.266,.983)],.009,WHITE)
cube("hoodie-kitty-face",(0,-.253,1.139),(.193,.025,.152),WHITE,bevel=.07)
uv("kitty-ear-L",(-.065,-.267,1.229),(.050,.026,.060),WHITE)
uv("kitty-ear-R",(.065,-.267,1.229),(.050,.026,.060),WHITE)
for x in [-.055,.055]:
    uv("kitty-embroidery-eye", (x,-.278,1.155),(.014,.007,.014),DARK)
uv("kitty-pink-nose",(0,-.282,1.119),(.018,.010,.012),BLUSH)
line("hoodie-drawstring-left",[(-.082,-.231,1.320),(-.084,-.258,1.230)],.008,WHITE)
line("hoodie-drawstring-right",[(.082,-.231,1.320),(.085,-.258,1.236)],.008,WHITE)

# Lilac leggings and flexible hips.
uv("shorts-under-hoodie",(0,.001,.72),(.26,.20,.135),LAVDARK)
for side,pivot in [(-1,leftleg),(1,rightleg)]:
    uv("legging-thigh-"+str(side),(0,0,-.16),(.132,.150,.25),LAV,pivot)
    uv("legging-knee-"+str(side),(0,-.006,-.355),(.126,.135,.18),LAV,pivot)
    uv("sock-"+str(side),(0,0,-.515),(.106,.116,.067),WHITE,pivot)
    uv("shoe-main-"+str(side),(0,-.072,-.590),(.149,.235,.117),PINKLIGHT,pivot)
    uv("shoe-sole-"+str(side),(0,-.075,-.669),(.155,.236,.038),SOLE,pivot)
    line("shoelace-"+str(side),[(-.07,-.252,-.575),(0,-.273,-.586),(.07,-.252,-.575)],.009,WHITE,pivot)
    # A pair of five-petal embroidered daisies on each leg.
    for k,center in enumerate([(-.06,-.155,-.16),(.055,-.146,-.385)]):
        for n in range(5):
            t=2*pi*n/5
            uv("stitched-petal-%s-%s-%s"%(side,k,n),
               (center[0]+.024*cos(t),center[1],center[2]+.024*sin(t)),(.020,.009,.019),FLOWER,pivot,24,16)
        uv("daisy-center-%s-%s"%(side,k),(center[0],center[1]-.008,center[2]),(.016,.011,.016),GOLD,pivot,24,16)

# Sleeves have relaxed seams; hands are visible at the correct height.
for side,pivot in [(-1,leftarm),(1,rightarm)]:
    sleeve=uv("sleeve-"+str(side),(side*.03,.004,-.178),(.155,.16,.26),PINK,pivot)
    sleeve.rotation_euler[1]=side*.16
    uv("cuff-"+str(side),(side*.055,-.006,-.405),(.123,.125,.075),PINKDARK,pivot)
    uv("hand-"+str(side),(side*.057,-.03,-.520),(.102,.093,.143),SKIN,pivot)
    uv("thumb-"+str(side),(side*.139,-.10,-.520),(.041,.046,.067),SKIN,pivot,24,16)

# Head: cheeks taper subtly, huge expressive eyes, gradient of playful features.
uv("face-sculpt",(0,0,.122),(.339,.304,.356),SKIN,head)
uv("soft-chin",(0,-.106,-.148),(.229,.207,.147),SKIN,head)
for side in [-1,1]:
    uv("ear-"+str(side),(side*.329,.035,.114),(.078,.062,.111),SKIN,head)
    uv("ear-inner-"+str(side),(side*.381,-.015,.117),(.028,.023,.045),BLUSH,head,24,16)
    uv("sclera-"+str(side),(side*.139,-.281,.172),(.099,.049,.133),EYEWHITE,head)
    uv("iris-outer-"+str(side),(side*.142,-.327,.165),(.067,.031,.092),IRIS2,head)
    uv("hazel-iris-"+str(side),(side*.142,-.348,.166),(.052,.026,.080),IRIS,head)
    uv("black-pupil-"+str(side),(side*.139,-.369,.164),(.035,.018,.061),PUPIL,head)
    uv("eye-sparkle-large-"+str(side),(side*.123,-.385,.201),(.018,.008,.023),SPARKLE,head,24,16)
    uv("eye-sparkle-small-"+str(side),(side*.166,-.381,.141),(.009,.006,.011),SPARKLE,head,24,16)
    uv("rosy-cheek-"+str(side),(side*.243,-.271,.012),(.067,.022,.041),BLUSH,head)
    line("upper-eyelid-"+str(side),[(side*.055,-.326,.244),(side*.135,-.348,.292),(side*.224,-.313,.257)],.016,HAIR,head,[.7,1,.7])
    line("eyebrow-"+str(side),[(side*.074,-.272,.332),(side*.139,-.275,.36),(side*.22,-.259,.333)],.017,HAIR,head)
uv("small-nose",(0,-.326,.064),(.050,.060,.045),SKINLIGHT,head,32,22)
line("smiling-mouth",[(-.087,-.293,-.067),(0,-.318,-.100),(.085,-.291,-.069)],.012,DARK,head,[.75,1,.75])
uv("lower-lip",(0,-.297,-.114),(.061,.011,.013),BLUSH,head,24,16)

# Haircap and thick sculpted locks, with warm highlights and intentional silhouette.
uv("crown-back",(0,.08,.315),(.368,.338,.275),HAIR,head)
uv("hair-back-length",(0,.218,-.065),(.328,.192,.345),HAIR,head)
uv("hair-left-volume",(-.282,.107,-.024),(.120,.16,.33),HAIR,head)
uv("hair-right-volume",(.290,.105,-.024),(.125,.16,.34),HAIR,head)
for side in [-1,1]:
    uv("sideburn-"+str(side),(side*.31,-.135,.045),(.082,.104,.235),HAIR,head)
    uv("side-lock-shine-"+str(side),(side*.332,-.228,-.025),(.029,.027,.126),HAIRHL,head)
# Sculpted swept bangs curve across the forehead.
for i in range(9):
    x=-.31+i*.080
    start=(x*.7,.005,.552)
    mid=(x*.94,-.221,.430+.033*sin(i*.8))
    end=(x+.055,-.290,.284+(.065 if i>5 else 0))
    line("swept-hair-strand-%02d"%i,[start,mid,end],.033 if i%2 else .041,HAIRHL if i in (1,4,7) else HAIR,head,[.65,1,.12])
# Long hair ribbon tails and heart bow on the right.
bow=empty("BowAnchor",(.257,-.155,.522),head)
for side in [-1,1]:
    ear=uv("pink-bow-loop-"+str(side),(side*.09,0,0),(.121,.043,.083),PINKLIGHT,bow)
    ear.rotation_euler[1]=side*.44
    uv("bow-inner-loop-"+str(side),(side*.112,-.040,.012),(.048,.013,.040),PINK,bow,24,18)
    ribbon=uv("bow-ribbon-tail-"+str(side),(side*.05,.004,-.111),(.041,.024,.106),PINKLIGHT,bow)
    ribbon.rotation_euler[1]=side*.25
uv("bow-knot",(0,-.055,.004),(.060,.048,.056),PINK,bow)
# Little pastel bracelets and embroidered heart accents.
uv("hoodie-heart",(.190,-.195,1.049),(.036,.018,.034),WHITE)
uv("bow-specular",(0,-.107,.012),(.021,.011,.019),WHITE,bow,24,16)

# Small studio under the avatar, not exported.
studio=material("studio mauve backdrop",(.80,.74,.72),1)
bpy.ops.mesh.primitive_plane_add(size=200,location=(0,0,-.012))
plane=bpy.context.object;plane.name="STUDIO_ONLY_plane";plane.data.materials.append(studio)

def area(name,loc,power,color,size):
    data=bpy.data.lights.new(name,'AREA');data.energy=power;data.color=color;data.shape='DISK';data.size=size
    obj=bpy.data.objects.new(name,data);bpy.context.collection.objects.link(obj);obj.location=loc
    direction=Vector((0,0,1.0))-obj.location;obj.rotation_euler=direction.to_track_quat('-Z','Y').to_euler()
area("STUDIO_ONLY_warm_key",(-3,-4,5),650,(1,.84,.74),4.0)
area("STUDIO_ONLY_big_softbox",(3,-3,4),420,(.83,.90,1),4.0)
area("STUDIO_ONLY_rim_light",(1.2,2.7,4),700,(1,.87,.75),3.0)
world=bpy.context.scene.world or bpy.data.worlds.new("warm atmosphere")
bpy.context.scene.world=world;world.use_nodes=True
bg=world.node_tree.nodes.get('Background');bg.inputs["Color"].default_value=(.79,.84,.87,1);bg.inputs["Strength"].default_value=.7

camera=bpy.data.cameras.new("STUDIO_ONLY_cam")
cam_obj=bpy.data.objects.new("STUDIO_ONLY_camera",camera);bpy.context.collection.objects.link(cam_obj)
bpy.context.scene.camera=cam_obj;camera.type='ORTHO';camera.ortho_scale=2.9
def aim_camera(pos,look=(0,0,1.05)):
    cam_obj.location=pos
    cam_obj.rotation_euler=(Vector(look)-cam_obj.location).to_track_quat('-Z','Y').to_euler()
bpy.context.scene.render.resolution_x=720
bpy.context.scene.render.resolution_y=880
bpy.context.scene.render.resolution_percentage=100
bpy.context.scene.render.image_settings.file_format='PNG'
# Deterministic headless rendering: use Cycles CPU (does not require a GPU/display server).
bpy.context.scene.render.engine='CYCLES'
bpy.context.scene.cycles.device='CPU'
bpy.context.scene.cycles.samples=12
if hasattr(bpy.context.scene.cycles,'use_denoising'): bpy.context.scene.cycles.use_denoising=True
if hasattr(bpy.context.view_layer,'cycles') and hasattr(bpy.context.view_layer.cycles,'use_denoising'):
    bpy.context.view_layer.cycles.use_denoising=True
bpy.context.scene.camera.data.lens=46
bpy.context.view_layer.update()
for label,pos in [('front',(0,-5.7,2.58)),('threequarter',(3.2,-5.5,2.45)),('profile',(5.8,-.7,2.2))]:
    aim_camera(pos)
    bpy.context.scene.render.filepath=os.path.join(OUT,'hanna-'+label+'.png')
    bpy.ops.render.render(write_still=True)
    print('RENDER_OK',label,bpy.context.scene.render.filepath)

# Export only original character nodes and materials; studio, lights, cameras excluded.
bpy.ops.object.select_all(action='DESELECT')
for o in all_assets:o.select_set(True)
bpy.context.view_layer.objects.active=root
model_path=os.path.join(OUT,'hanna-v3.glb')
bpy.ops.export_scene.gltf(filepath=model_path,export_format='GLB',use_selection=True,
    export_yup=True,export_apply=False,export_animations=False,export_materials='EXPORT')
print('MODEL_OK',model_path,os.path.getsize(model_path))
info={
 'name':'Hanna 3.0 — artistic prototype',
 'format':'GLB (glTF 2.0)',
 'origin':'Blender-generated original geometry; no purchased/downloaded models',
 'license':'Original project asset for Casa da Hanna',
 'limitations':'Unrigged segmented mesh with animation pivots for runtime JS; face and clothing require human visual approval',
 'nodes':len(all_assets),
 'meshes':sum(o.type=='MESH' for o in all_assets),
 'files':['hanna-v3.glb','hanna-front.png','hanna-threequarter.png','hanna-profile.png']
}
with open(os.path.join(OUT,'manifest.json'),'w') as f:json.dump(info,f,indent=2,ensure_ascii=False)
print('CHARACTER_BUILD_COMPLETE',json.dumps(info,ensure_ascii=False))
