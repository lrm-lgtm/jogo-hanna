#!/usr/bin/env python3
"""Hanna 3.0: free Blender character workshop. Generates 3D GLB and real Blender renders.
No Codex, subscription, bought models or downloaded proprietary assets.
Character contract: actual playable avatar, teal floral tank, pink tiered skirt, pink hi-tops, high ponytail, pastel plush octopus backpack.
The model is a new, stylized *original game character*, not a likeness of a real child.
"""
import bpy, math, os, json, random
from mathutils import Vector
from math import sin, cos, pi
random.seed(15)
HERE=os.path.dirname(os.path.abspath(__file__))
OUT=os.path.abspath(os.path.join(HERE,"../assets"))
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

# R8 — latest visual reference: pink hoodie, short denim dungarees, large pink satin bow.
# All new meshes are original; pivot names stay stable for Babylon.js interactions.
DENIM_LIGHT=material("soft blue denim",(.30,.51,.68),.79)
DENIM_DARK=material("indigo denim seams",(.21,.36,.53),.88)
PINK_CUFF=material("peach rose hoodie trim",(.91,.38,.55),.82)
PINK_PALE=material("pastel hoodie highlight",(.99,.61,.72),.78)
CREAM_FABRIC=material("cream stitching",(.99,.91,.82),.92)
JACKET_LOVE=material("heart appliqué",(.90,.30,.48),.64)
HONEY=material("gold button metal",(.77,.54,.23),.43,.14)
# Slightly broad shoulder and puffy cloth gives a soft child-like silhouette.
uv("hoodie-body",(0,0,1.11),(.293,.178,.279),PINK)
uv("hoodie-side-folds",(0,.025,.915),(.255,.160,.090),PINKDARK)
uv("hoodie-bottom-rib",(0,-.014,.879),(.269,.175,.051),PINK_CUFF)
uv("hood-back",(0,.136,1.281),(.258,.155,.159),PINK)
uv("hood-inner",(0,.025,1.337),(.153,.120,.069),PINKDARK)
uv("neck",(0,-.015,1.405),(.095,.084,.090),SKIN)
uv("white-shirt-collar",(0,-.097,1.329),(.148,.054,.043),CREAM_FABRIC)
# Small dangling hood drawstrings over dungaree bib.
for side in (-1,1):
    line("hood-drawstring-%s"%side,[(side*.081,-.158,1.300),(side*.091,-.215,1.188),
         (side*.075,-.229,1.095)],.007,CREAM_FABRIC,root,[1,.90,.70])
    uv("cord-tip-%s"%side,(side*.075,-.232,1.092),(.015,.013,.020),PINK_PALE,root,20,12)
# Actual dungaree bib layered across sweater, softly rounded and stitched.
cube("denim-bib",(0,-.180,1.086),(.337,.043,.272),DENIM_LIGHT,bevel=.060)
cube("front-bib-pocket",(0,-.216,1.061),(.203,.020,.125),DENIM,bevel=.026)
line("bib-pocket-edge",[(-.100,-.231,1.115),(0,-.230,1.113),(.100,-.231,1.115)],
     .006,CREAM_FABRIC)
for side in (-1,1):
    line("denim-suspender-%s"%side,[(side*.125,-.191,1.207),(side*.196,-.202,1.273),
         (side*.208,-.118,1.342)],.040,DENIM_LIGHT,root,[.90,1.08,.68])
    uv("bib-golden-button-%s"%side,(side*.142,-.229,1.215),(.023,.014,.026),
       HONEY,root,24,16)
# Shorts actually wrap waist and have two leg openings with visible cuffs.
uv("denim-short-body",(0,-.004,.765),(.286,.192,.139),DENIM_LIGHT)
for side in (-1,1):
    uv("denim-short-leg-%s"%side,(side*.139,-.005,.704),(.152,.186,.125),DENIM_LIGHT)
    uv("denim-short-cuff-%s"%side,(side*.142,-.006,.641),(.155,.189,.032),DENIM_DARK)
    line("seam-short-%s"%side,[(side*.155,-.180,.778),(side*.155,-.185,.717),
        (side*.148,-.192,.659)],.006,CREAM_FABRIC)
    cube("heart-pocket-%s"%side,(side*.211,.181,.753),(.103,.013,.083),DENIM,bevel=.020)
# Embroidered heart at shorts back + left knee flower.
for angle in range(2):
    uv("short-heart-lobe-%s"%angle,(-.206+angle*.067,.203,.775),
      (.051,.015,.046),JACKET_LOVE,root,24,16)
hearttip=uv("short-heart-point",(-.174,.205,.743),(.039,.011,.038),JACKET_LOVE,root,20,12)
# R12: real HIERARCHICAL articulated legs. Hip (existing) -> knee -> ankle.
# The old GLB attached every calf/shoe to the hip so the entire leg swung as a rigid
# piece; an animation could never bend the knee, regardless of Babylon keyframes.
for side,hip in [(-1,leftleg),(1,rightleg)]:
    knee=empty("KneeLeftPivot" if side<0 else "KneeRightPivot",(0,0,-.300),hip)
    ankle=empty("AnkleLeftPivot" if side<0 else "AnkleRightPivot",(0,0,-.253),knee)
    # Hip owns the thigh, knee owns shin, ankle owns shoe. Coordinates local to pivots.
    uv("thigh-segment-%s"%side,(0,0,-.143),(.103,.109,.196),SKIN,hip)
    uv("kneecap-%s"%side,(0,-.017,-.008),(.101,.100,.085),SKIN,knee)
    uv("shin-segment-%s"%side,(0,-.009,-.113),(.085,.092,.153),SKIN,knee)
    uv("sock-rib-%s"%side,(0,-.010,-.018),(.107,.106,.054),CREAM_FABRIC,ankle)
    uv("pink-boot-upper-%s"%side,(0,-.025,-.076),(.132,.169,.123),PINKLIGHT,ankle)
    uv("pink-boot-soft-sole-%s"%side,(0,-.075,-.147),(.148,.192,.034),SOLE,ankle)
    uv("pink-boot-toe-%s"%side,(0,-.190,-.114),(.129,.064,.057),CREAM_FABRIC,ankle)
    for k in range(3):
        z=-.036-k*.023
        line("shoe-cross-lace-%s-%s"%(side,k),[(-.071,-.182,z),
             (0,-.213,z-.009),(.071,-.182,z)],.006,CREAM_FABRIC,ankle)
    uv("shoe-side-heart-%s"%side,(side*.13,-.025,-.067),(.022,.020,.026),PINKDARK,ankle,24,16)

# R15: articulated shoulder > elbow > wrist with a stable grip marker.
# Meshes are parented to the joint that actually moves them, not to a stiff upper arm.
for side,shoulder in [(-1,leftarm),(1,rightarm)]:
    elbow=empty("ElbowLeftPivot" if side<0 else "ElbowRightPivot",
                (side*.035,-.007,-.232),shoulder)
    wrist=empty("WristLeftPivot" if side<0 else "WristRightPivot",
                (side*.021,-.016,-.228),elbow)
    grip=empty("HandLeftGrip" if side<0 else "HandRightGrip",
               (side*.002,-.058,-.037),wrist)
    uv("hoodie-puff-sleeve-%s"%side,(side*.009,0,-.100),(.137,.127,.160),PINK,shoulder)
    uv("hoodie-cuff-%s"%side,(0,0,.008),(.105,.106,.049),PINK_CUFF,elbow)
    uv("forearm-%s"%side,(side*.009,0,-.118),(.081,.081,.134),SKIN,elbow)
    uv("hand-%s"%side,(0,0,-.019),(.079,.074,.106),SKIN,wrist)
    uv("thumb-%s"%side,(side*.052,-.05,-.023),(.032,.039,.058),SKIN,wrist,24,16)
    for finger in range(3):
        uv("finger-%s-%s"%(side,finger),((finger-1)*.034,-.042,-.093),
           (.022,.028,.041),SKIN,wrist,20,12)

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
uv("crown-back",(0,.09,.324),(.334,.299,.265),HAIR,head)
uv("hair-back-length",(0,.248,-.018),(.275,.123,.307),HAIR,head)
uv("hair-left-volume",(-.260,.155,.015),(.080,.102,.25),HAIR,head)
uv("hair-right-volume",(.270,.155,.015),(.076,.108,.249),HAIR,head)
for side in [-1,1]:
    uv("sideburn-"+str(side),(side*.297,-.086,.072),(.046,.072,.172),HAIR,head)
    uv("side-lock-shine-"+str(side),(side*.302,-.140,.025),(.018,.017,.104),HAIRHL,head)
# Sculpted swept bangs curve across the forehead.
# Layered side-swept bangs with less geometric/pencil-like roots and tapered tips.
for i in range(10):
    x=.312-i*.067
    start=(x*.76,-.075,.532)
    mid=(x-.030,-.175,.478+.014*sin(i*.83))
    end=(x-.097,-.229,.338+.035*sin(i*.52))
    line("soft-swept-fringe-%02d"%i,[start,mid,end],
         .025 if i%2 else .030,HAIRHL if i in (2,7) else HAIR,head,[.35,.93,.009])
# Directional, curled locks around the face replace unnaturally round side clumps.
for side in [-1,1]:
    for i in range(4):
        x=side*(.286 + i*.007)
        line("soft-tapered-side-lock-%s-%s"%(side,i),
             [(x,-.012,.31-i*.023),(side*(.331+i*.005),-.019,.083-i*.030),(side*(.291+i*.009),.034,-.171-i*.027)],
             .021,HAIRHL if i==1 else HAIR,head,[1,.73,.028])
# R4 high ponytail: distinct tapered locks draping behind head, pink bow at tie.
uv("high-ponytail-tie",(0,.285,.456),(.087,.073,.077),PINKDARK,head)
for i in range(20):
    a=2*pi*i/20
    x=.138*cos(a);y=.30+.073*sin(a)
    line("high-wavy-ponytail-%02d"%i,
         [(x*.60,y,.465),(x*.93,y+.056,.261),(x+.021*sin(i),y+.074,-.075),
          (x+.035*sin(i*1.3),y+.020,-.355),(x+.032,y,-.504)],
         .035,HAIRHL if i in (2,6,11,16) else HAIR,head,[.50,1.15,1,.80,.02])
# Oversized, fabric-like hair ribbon anchored on the high ponytail, visible front and rear.
bow=empty("BowAnchor",(-.115,-.152,.575),head)
for side in [-1,1]:
    loop=uv("signature-pink-hair-bow-%s"%side,(side*.097,-.016,.012),(.130,.042,.086),PINKLIGHT,bow)
    loop.rotation_euler[1]=side*.31
    uv("bow-loop-inside-%s"%side,(side*.125,-.056,.012),(.065,.010,.047),PINK,bow,24,18)
    ribbon=uv("bow-tail-%s"%side,(side*.038,.016,-.113),(.034,.020,.120),PINKLIGHT,bow)
    ribbon.rotation_euler[1]=side*.14
uv("bow-satin-knot",(0,-.063,.002),(.066,.046,.060),PINK,bow)
# Little pastel bracelets and embroidered heart accents.
uv("teal-outfit-flower-button",(.190,-.153,1.049),(.022,.009,.024),WHITE)
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
bpy.context.scene.render.resolution_x=480
bpy.context.scene.render.resolution_y=620
bpy.context.scene.render.resolution_percentage=100
bpy.context.scene.render.image_settings.file_format='PNG'
# Deterministic headless rendering: use Cycles CPU (does not require a GPU/display server).
bpy.context.scene.render.engine='CYCLES'
bpy.context.scene.cycles.device='CPU'
bpy.context.scene.cycles.samples=10
if hasattr(bpy.context.scene.cycles,'use_denoising'): bpy.context.scene.cycles.use_denoising=False
if hasattr(bpy.context.view_layer,'cycles') and hasattr(bpy.context.view_layer.cycles,'use_denoising'):
    bpy.context.view_layer.cycles.use_denoising=False
bpy.context.scene.camera.data.lens=46
bpy.context.view_layer.update()
for label,pos in [('front',(0,-5.7,2.58)),('threequarter',(3.2,-5.5,2.45))]:
    aim_camera(pos)
    bpy.context.scene.render.filepath=os.path.join(OUT,'hanna-r8-'+label+'.png')
    bpy.ops.render.render(write_still=True)
    print('RENDER_OK',label,bpy.context.scene.render.filepath)

# Export only original character nodes and materials; studio, lights, cameras excluded.
bpy.ops.object.select_all(action='DESELECT')
for o in all_assets:o.select_set(True)
bpy.context.view_layer.objects.active=root
model_path=os.path.join(OUT,'hanna-free-r8.glb')
bpy.ops.export_scene.gltf(filepath=model_path,export_format='GLB',use_selection=True,
    export_yup=True,export_apply=False,export_animations=False,export_materials='EXPORT')
print('MODEL_OK',model_path,os.path.getsize(model_path))
info={
 'name':'Hanna R15 — free articulated hands and breakfast interaction rig',
 'art_contract':'v2/blender/ART_R8.md',
 'round':'R15-elbow-wrist-grip-anchors',
 'format':'GLB (glTF 2.0)',
 'origin':'Blender-generated original geometry; no purchased/downloaded models',
 'license':'Original project asset for Casa da Hanna',
 'limitations':'Segmented hips/knees/ankles plus R15 elbows/wrists/grips, not a fully skinned professional character. Mobile art approval pending',
 'nodes':len(all_assets),
 'meshes':sum(o.type=='MESH' for o in all_assets),
 'files':['hanna-free-r8.glb','hanna-r8-front.png','hanna-r8-threequarter.png']
}
with open(os.path.join(OUT,'hanna-r8-manifest.json'),'w') as f:json.dump(info,f,indent=2,ensure_ascii=False)
print('CHARACTER_BUILD_COMPLETE',json.dumps(info,ensure_ascii=False))
