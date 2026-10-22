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

SKIN=material("warm peach skin",(.89,.54,.40),.69,subsurf=.07)
SKINLIGHT=material("gentle nose highlight",(0.90,.56,.42),.62)
BLUSH=material("rosy cheek",(.86,.34,.38),.89)
HAIR=material("deep chocolate brown hair",(.095,.036,.022),.44)
HAIRHL=material("warm chestnut highlights",(.16,.069,.038),.49)
EYEWHITE=material("soft ivory eyes",(.99,.96,.91),.18)
IRIS=material("honey hazel iris",(.19,.090,.037),.22)
IRIS2=material("golden iris ring",(.47,.25,.065),.27)
PUPIL=material("very dark pupil",(.024,.019,.022),.08)
SPARKLE=material("eye catchlight",(1,1,.98),.06)
PINK=material("hoodie strawberry pink",(.83,.25,.42),.65)
PINKDARK=material("pink shadow piping",(.67,.20,.34),.73)
PINKLIGHT=material("powder pink shoes and bow",(.96,.48,.63),.52)
WHITE=material("buttercream embroidery",(.92,.82,.68),.71)
LAV=material("soft lilac leggings",(.48,.36,.67),.7)
LAVDARK=material("lilac seams",(.43,.34,.67),.66)
FLOWER=material("tiny daisy embroidery",(.99,.88,.69),.73)
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

# Stylized child proportions: character model intended for a playful mobile game.
# Artistic v2: sculpted face, recessed eyes, tapered hair ribbons, softer fabric silhouettes.
uv("hoodie-body",(0,-.004,1.04),(.289,.204,.315),PINK)
uv("hoodie-waist-rib",(0,-.001,.77),(.285,.209,.062),PINKDARK)
uv("hoodie-hood",(0,.171,1.34),(.252,.098,.20),PINKDARK)
uv("hood-inner",(0,.239,1.375),(.185,.032,.149),PINKLIGHT)
uv("neck",(0,-.015,1.383),(.103,.085,.10),SKIN)
# Pouch pocket and kitty stitched detail.
uv("front-hoodie-pocket",(0,-.21,.94),(.168,.025,.088),PINKLIGHT)
line("pocket-top-stitch",[(-.145,-.233,.983),(0,-.244,1.003),(.145,-.233,.983)],.006,WHITE)
cube("hoodie-kitty-face",(0,-.214,1.130),(.172,.014,.135),WHITE,bevel=.052)
uv("kitty-ear-L",(-.057,-.218,1.209),(.036,.018,.041),WHITE)
uv("kitty-ear-R",(.057,-.218,1.209),(.036,.018,.041),WHITE)
for x in [-.055,.055]:
    uv("kitty-embroidery-eye", (x,-.232,1.151),(.010,.005,.011),DARK)
uv("kitty-pink-nose",(0,-.236,1.124),(.014,.008,.011),BLUSH)
line("hoodie-drawstring-left",[(-.082,-.231,1.320),(-.084,-.258,1.230)],.008,WHITE)
line("hoodie-drawstring-right",[(.082,-.231,1.320),(.085,-.258,1.236)],.008,WHITE)

# Lilac leggings and flexible hips.
uv("shorts-under-hoodie",(0,.001,.72),(.26,.20,.135),LAVDARK)
for side,pivot in [(-1,leftleg),(1,rightleg)]:
    uv("legging-thigh-"+str(side),(0,0,-.17),(.129,.129,.24),LAV,pivot)
    uv("legging-knee-"+str(side),(0,-.006,-.355),(.124,.130,.18),LAV,pivot)
    uv("sock-"+str(side),(0,0,-.515),(.106,.116,.067),WHITE,pivot)
    uv("shoe-main-"+str(side),(0,-.063,-.590),(.147,.206,.101),PINKLIGHT,pivot)
    uv("shoe-sole-"+str(side),(0,-.063,-.669),(.155,.216,.031),SOLE,pivot)
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
    sleeve=uv("sleeve-"+str(side),(side*.02,.004,-.178),(.110,.121,.245),PINK,pivot)
    sleeve.rotation_euler[1]=side*.16
    uv("cuff-"+str(side),(side*.045,-.006,-.405),(.106,.103,.044),PINKDARK,pivot)
    uv("hand-"+str(side),(side*.057,-.03,-.510),(.092,.079,.121),SKIN,pivot)
    uv("thumb-"+str(side),(side*.139,-.10,-.520),(.041,.046,.067),SKIN,pivot,24,16)

# Head: cheeks taper subtly, huge expressive eyes, gradient of playful features.
face_mesh=uv("face-sculpt",(0,-.012,.122),(.342,.310,.352),SKIN,head)
# Anatomical sculpt: forehead softly round, lower face tapers into ONE continuous chin;
# no intersecting chin sphere or horizontal seam across her cheeks.
for v in face_mesh.data.vertices:
    z=v.co.z
    if z < -.04:
        v.co.x *= 1.0 - .17*min(1.0,max(0.,(-z-.04)/.95))
        v.co.y *= 1.0 - .055*min(1.0,max(0.,(-z-.04)/.95))
    elif z > .48:
        v.co.x *= 1.0 - .035*min(1.,(z-.48)/.52)
for side in [-1,1]:
    uv("ear-"+str(side),(side*.317,.038,.115),(.060,.047,.089),SKIN,head)
    uv("ear-inner-"+str(side),(side*.364,-.006,.115),(.016,.010,.028),BLUSH,head,24,16)
    uv("sclera-"+str(side),(side*.137,-.287,.176),(.080,.016,.100),EYEWHITE,head)
    uv("iris-outer-"+str(side),(side*.140,-.305,.169),(.061,.010,.080),IRIS2,head)
    uv("hazel-iris-"+str(side),(side*.139,-.312,.167),(.050,.008,.068),IRIS,head)
    uv("black-pupil-"+str(side),(side*.138,-.321,.168),(.036,.007,.050),PUPIL,head)
    uv("eye-sparkle-large-"+str(side),(side*.122,-.329,.203),(.015,.005,.018),SPARKLE,head,24,16)
    uv("eye-sparkle-small-"+str(side),(side*.163,-.328,.143),(.008,.004,.010),SPARKLE,head,24,16)
    uv("rosy-cheek-"+str(side),(side*.238,-.222,.019),(.065,.009,.034),BLUSH,head)
    line("upper-eyelid-"+str(side),[(side*.058,-.290,.257),(side*.136,-.302,.280),(side*.213,-.288,.251)],.009,HAIR,head,[.7,1,.6])
    line("soft-lower-lid-"+str(side),[(side*.062,-.289,.104),(side*.138,-.300,.087),(side*.214,-.288,.108)],.007,SKINLIGHT,head,[.2,1,.2])
    line("outer-eyelash-"+str(side),[(side*.211,-.280,.248),(side*.236,-.271,.273)],.008,HAIR,head,[.8,.03])
    line("eyebrow-"+str(side),[(side*.076,-.277,.321),(side*.139,-.279,.340),(side*.210,-.259,.324)],.010,HAIR,head)
uv("small-nose",(0,-.306,.066),(.037,.029,.026),SKINLIGHT,head,32,22)
line("smiling-mouth",[(-.071,-.261,-.063),(0,-.273,-.082),(.071,-.259,-.063)],.008,DARK,head,[.65,1,.65])
uv("lower-lip",(0,-.244,-.112),(.050,.007,.009),BLUSH,head,24,16)

# Haircap and thick sculpted locks, with warm highlights and intentional silhouette.
uv("crown-back",(0,.09,.324),(.342,.306,.269),HAIR,head)
uv("hair-back-length",(0,.248,-.018),(.275,.123,.307),HAIR,head)
uv("hair-left-volume",(-.260,.155,.015),(.080,.102,.25),HAIR,head)
uv("hair-right-volume",(.270,.155,.015),(.076,.108,.249),HAIR,head)
for side in [-1,1]:
    uv("sideburn-"+str(side),(side*.297,-.086,.072),(.046,.072,.172),HAIR,head)
    uv("side-lock-shine-"+str(side),(side*.302,-.140,.025),(.018,.017,.104),HAIRHL,head)
# Sculpted swept bangs curve across the forehead.
# Side-swept layered bangs, not a row of identical vertical cylindrical strips.
for i in range(7):
    x=.272-i*.089
    start=(x+.067,-.092,.539)
    mid=(x-.027,-.236,.444+.017*sin(i*.75))
    end=(x-.106,-.262,.306+.040*sin(i*.43))
    line("side-swept-fringe-%02d"%i,[start,mid,end],
         .028 if i%2 else .034,HAIRHL if i in (1,5) else HAIR,head,[.38,1,.045])
# Directional, curled locks around the face replace unnaturally round side clumps.
for side in [-1,1]:
    for i in range(4):
        x=side*(.286 + i*.007)
        line("soft-tapered-side-lock-%s-%s"%(side,i),
             [(x,-.012,.31-i*.023),(side*(.331+i*.005),-.019,.083-i*.030),(side*(.291+i*.009),.034,-.171-i*.027)],
             .021,HAIRHL if i==1 else HAIR,head,[1,.73,.028])
# Single side ponytail, sculpted taper and strands that follow the silhouette.
uv("ponytail-tie",(.23,.280,.20),(.069,.051,.068),PINKDARK,head)
for i in range(12):
    t=2*pi*i/12
    x=.23+.09*cos(t)
    y=.278+.047*sin(t)
    line("flowing-ponytail-%02d"%i,
         [(x,y,.20),(x+.013,.327,-.050),(x+.062,.276,-.30),(x+.037,.247,-.48)],.030,
         HAIRHL if i in (1,3,7) else HAIR,head,[.43,1,.75,.018])
# Long hair ribbon tails and heart bow on the right.
bow=empty("BowAnchor",(.195,-.21,.534),head)
for side in [-1,1]:
    ear=uv("pink-bow-loop-"+str(side),(side*.074,0,0),(.097,.025,.067),PINKLIGHT,bow)
    ear.rotation_euler[1]=side*.44
    uv("bow-inner-loop-"+str(side),(side*.085,-.021,.012),(.034,.009,.027),PINK,bow,24,18)
    ribbon=uv("bow-ribbon-tail-"+str(side),(side*.036,.013,-.087),(.027,.017,.073),PINKLIGHT,bow)
    ribbon.rotation_euler[1]=side*.25
uv("bow-knot",(0,-.027,.004),(.044,.031,.043),PINK,bow)
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
area("STUDIO_ONLY_warm_key",(-3,-4,5),600,(1,.86,.75),4.0)
area("STUDIO_ONLY_big_softbox",(3,-3,4),310,(.91,.93,1),4.0)
area("STUDIO_ONLY_rim_light",(1.2,2.7,4),400,(1,.89,.78),3.0)
world=bpy.context.scene.world or bpy.data.worlds.new("warm atmosphere")
bpy.context.scene.world=world;world.use_nodes=True
bg=world.node_tree.nodes.get('Background');bg.inputs["Color"].default_value=(.70,.73,.77,1);bg.inputs["Strength"].default_value=.4

camera=bpy.data.cameras.new("STUDIO_ONLY_cam")
cam_obj=bpy.data.objects.new("STUDIO_ONLY_camera",camera);bpy.context.collection.objects.link(cam_obj)
bpy.context.scene.camera=cam_obj;camera.type='ORTHO';camera.ortho_scale=2.9
def aim_camera(pos,look=(0,0,1.05)):
    cam_obj.location=pos
    cam_obj.rotation_euler=(Vector(look)-cam_obj.location).to_track_quat('-Z','Y').to_euler()
# Match the render and real-time glTF material exposure with a gentle filmic display.
try:
    bpy.context.scene.view_settings.view_transform='AgX'
    bpy.context.scene.view_settings.look='AgX - Medium High Contrast'
except Exception:
    bpy.context.scene.view_settings.view_transform='Standard'
bpy.context.scene.render.resolution_x=720
bpy.context.scene.render.resolution_y=880
bpy.context.scene.render.resolution_percentage=100
bpy.context.scene.render.image_settings.file_format='PNG'
# Deterministic headless rendering: use Cycles CPU (does not require a GPU/display server).
bpy.context.scene.render.engine='CYCLES'
bpy.context.scene.cycles.device='CPU'
bpy.context.scene.cycles.samples=32
if hasattr(bpy.context.scene.cycles,'use_denoising'): bpy.context.scene.cycles.use_denoising=False
if hasattr(bpy.context.view_layer,'cycles') and hasattr(bpy.context.view_layer.cycles,'use_denoising'):
    bpy.context.view_layer.cycles.use_denoising=False
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
