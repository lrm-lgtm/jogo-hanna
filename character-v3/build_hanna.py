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

# R4: the user's cartoon reference is the actual playable player specification.
# High-ponytail girl in teal floral tank, multi-layer ruffled pink skirt, high-top sneakers,
# pastel plush octopus backpack. The torso and backpack follow the same HannaRig as animations.
TEAL=material("teal floral tank",(.15,.58,.56),.83)
TEAL_RIB=material("neck binding teal",(.10,.43,.43),.87)
SKIRT=material("rose layered skirt",(.96,.30,.48),.82)
SKIRT_HEM=material("soft rose hem",(.98,.49,.62),.84)
OCTO_LILAC=material("plush octopus lavender",(.66,.53,.83),.97)
OCTO_CREAM=material("plush octopus ivory",(.98,.82,.71),.96)
OCTO_PINK=material("plush octopus pink",(.99,.63,.73),.97)
OCTO_BLUE=material("plush octopus sky",(.60,.78,.86),.97)
OCTO_DARK=material("octopus embroidered eyes",(.19,.095,.13),.89)
LACE=material("pink shoelaces",(.98,.80,.84),.81)
uv("teal-cotton-tank",(0,-.006,1.095),(.267,.172,.268),TEAL)
uv("collar-binding",(0,-.103,1.332),(.139,.070,.043),TEAL_RIB)
uv("neck",(0,-.014,1.390),(.094,.080,.092),SKIN)
for side in [-1,1]:
    # Bare upper shoulders are visible: this is a SLEEVELESS top, not the prior hoodie.
    # True sleeveless shoulder straps are subtle fabric bands (not round puffballs).
    line("tank-fabric-shoulder-strap-%s"%side,
         [(side*.159,-.115,1.296),(side*.190,-.065,1.341),
          (side*.207,.012,1.317),(side*.215,.079,1.264)],.037,TEAL,root,[1,1,.85,.72])
    line("armhole-binding-%s"%side,
         [(side*.244,-.075,1.297),(side*.262,-.072,1.229),(side*.259,-.018,1.175)],.005,TEAL_RIB)
# 3 separate embroidered flowers, curved on the front of the actual turquoise fabric.
for idx,(xx,zz,scale) in enumerate([(-.085,1.12,.043),(.105,1.17,.052),(.009,1.035,.041)]):
    for petal in range(5):
        theta=2*pi*petal/5
        uv("shirt-daisy-%s-%s"%(idx,petal),
           (xx+scale*.76*cos(theta),-.179-.010*(1-abs(xx)),zz+scale*.76*sin(theta)),
           (scale*.51,.009,scale*.39),WHITE if idx!=1 else OCTO_PINK,root,24,16)
    uv("shirt-daisy-gold-%s"%idx,(xx,-.198,zz),(scale*.32,.010,scale*.32),GOLD,root,24,16)
# Real ruffled skirt geometry: connected rings with tapered fabric folds, not spheres.
def ruffled_layer(name,z1,z2,top_r,bottom_r,material,phase):
    segments=96;levels=8;verts=[];faces=[]
    for j in range(levels):
        tt=j/(levels-1);z=z1+(z2-z1)*tt
        for i in range(segments):
            a=i*2*pi/segments
            wave=sin(a*10+phase)*(.004+.014*tt**1.7)
            radius=(top_r+(bottom_r-top_r)*tt)+wave
            elliptic_y=.78
            height_bounce=sin(a*10+phase)*(.009*tt**2)
            verts.append((radius*cos(a),radius*elliptic_y*sin(a),z+height_bounce))
    for j in range(levels-1):
        for i in range(segments):
            p=j*segments+i;q=j*segments+(i+1)%segments
            faces.append((p,q,q+segments,p+segments))
    mesh=bpy.data.meshes.new(name+"-surface");mesh.from_pydata(verts,[],faces);mesh.update()
    ob=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(ob)
    register(ob,name,material)
    modifier=ob.modifiers.new("fabric thickness","SOLIDIFY");modifier.thickness=.010
    modifier.offset=0
    return ob
uv("skirt-waistband",(0,-.006,.852),(.254,.175,.060),SKIRT)
ruffled_layer("skirt-layer-under",.88,.61,.245,.393,SKIRT_HEM,0.6)
ruffled_layer("skirt-layer-middle",.88,.68,.251,.354,SKIRT,1.4)
ruffled_layer("skirt-layer-top",.88,.75,.254,.315,SKIRT_HEM,2.0)
# Soft stitched hems follow the lower skirt contours in the same world geometry.
for layer,z,rad,phase in [("outer",.606,.391,.6),("middle",.678,.353,1.4)]:
    points=[]
    for i in range(33):
        a=i*2*pi/32
        r=rad+.014*sin(10*a+phase)
        points.append((r*cos(a),.78*r*sin(a),z+.009*sin(10*a+phase)))
    line("stitched-skirt-hem-"+layer,points,.007,WHITE,root)
line("pink-ribbon-waist",[(-.16,-.198,.856),(0,-.215,.853),(.16,-.198,.856)],.012,SKIRT_HEM)
# Waist bow
waist_bow=empty("WaistBow",(0,-.219,.852),root)
for side in [-1,1]:
    loop=uv("skirt-waist-bow-%s"%side,(side*.066,0,.015),(.077,.025,.045),SKIRT_HEM,waist_bow)
    loop.rotation_euler[1]=side*.40
    uv("skirt-ribbon-tail-%s"%side,(side*.03,-.005,-.058),(.024,.020,.065),SKIRT,waist_bow)
uv("skirt-bow-center",(0,-.030,.013),(.030,.030,.028),PINK,waist_bow)
# Bare legs, anatomically tapered from skirt to ankle. Shoes are pink HIGH TOPS with laces/hearts.
for side,pivot in [(-1,leftleg),(1,rightleg)]:
    uv("natural-thigh-"+str(side),(0,0,-.190),(.105,.105,.229),SKIN,pivot)
    uv("natural-knee-"+str(side),(0,0,-.335),(.091,.092,.095),SKIN,pivot)
    uv("natural-calf-"+str(side),(0,0,-.423),(.083,.086,.148),SKIN,pivot)
    uv("white-ribbed-sock-"+str(side),(0,-.006,-.528),(.105,.105,.073),WHITE,pivot)
    uv("high-top-sneaker-upper-"+str(side),(0,-.025,-.596),(.129,.169,.123),PINKLIGHT,pivot)
    uv("high-top-sneaker-sole-"+str(side),(0,-.076,-.672),(.145,.195,.032),SOLE,pivot)
    uv("pink-shoe-toecap-"+str(side),(0,-.188,-.641),(.126,.065,.057),WHITE,pivot)
    line("high-top-laces-"+str(side),[(0,-.198,-.543),(0,-.207,-.565),(0,-.218,-.588),
         (0,-.219,-.616)],.007,LACE,pivot)
    for k in range(3):
        z=-.558-k*.021
        line("cross-lace-%s-%s"%(side,k),[(-.068,-.184,z),(0,-.214,z-.012),(.068,-.184,z)],.006,LACE,pivot)
    uv("high-top-heart-%s"%side,(side*.130,-.023,-.588),(.019,.019,.028),PINKDARK,pivot,24,16)
# Arms: real skin, wrists, tiny fingers and thumbs; pivot animation preserved for runtime.
for side,pivot in [(-1,leftarm),(1,rightarm)]:
    upper=uv("bare-shoulder-arm-"+str(side),(side*.019,0,-.145),(.097,.100,.208),SKIN,pivot)
    upper.rotation_euler[1]=side*.11
    uv("bare-forearm-"+str(side),(side*.045,-.002,-.342),(.085,.088,.158),SKIN,pivot)
    uv("hand-"+str(side),(side*.055,-.028,-.492),(.081,.073,.114),SKIN,pivot)
    uv("thumb-"+str(side),(side*.113,-.082,-.496),(.033,.041,.067),SKIN,pivot,24,16)
    for finger in range(3):
        uv("finger-%s-%s"%(side,finger),(side*.059+(finger-1)*.034,-.051,-.583),
            (.025,.031,.043),SKIN,pivot,20,12)
# Plush octopus BACKPACK, visible from back and 3/4; hangs directly on HannaRig, not static world.
# Front of backpack faces +Y; girl's face looks -Y.
octo=empty("PolvoBackpackAnchor",(0,.223,1.06),root)
uv("plush-octopus-head",(0,.115,.092),(.250,.182,.204),OCTO_LILAC,octo)
uv("plush-ivory-face",(0,.268,.070),(.182,.043,.115),OCTO_CREAM,octo)
for side in [-1,1]:
    uv("plush-small-ear-%s"%side,(side*.197,.132,.199),(.055,.059,.067),OCTO_LILAC,octo,28,18)
    uv("plush-eye-white-%s"%side,(side*.084,.300,.089),(.044,.013,.052),WHITE,octo,24,16)
    uv("plush-eye-pupil-%s"%side,(side*.084,.314,.088),(.027,.009,.034),OCTO_DARK,octo,24,16)
    uv("plush-eye-shine-%s"%side,(side*.076,.323,.109),(.009,.006,.012),SPARKLE,octo,20,12)
    uv("plush-cheek-%s"%side,(side*.128,.294,.008),(.036,.009,.020),OCTO_PINK,octo,20,12)
line("plush-smiling-mouth",[(-.055,.316,.001),(0,.323,-.035),(.055,.316,.001)],.009,OCTO_DARK,octo)
for i in range(8):
    a=2*pi*i/8
    x=.140*cos(a);y=.128+.085*sin(a)
    line("plush-octopus-tentacle-%02d"%i,
         [(x,y,-.032),(x*1.31,y+.037,-.175),(x*1.19,y+.036,-.328)],.059,
         [OCTO_PINK,OCTO_CREAM,OCTO_LILAC,OCTO_BLUE][i%4],octo,[.8,1,.35])
# Real backpack straps wrap shoulders, not 2D illustration.
for side in [-1,1]:
    line("lavender-backpack-strap-%s"%side,
         [(side*.129,.255,1.203),(side*.232,.139,1.278),(side*.235,-.066,1.215),(side*.191,-.191,1.058)],
         .019,OCTO_LILAC,root,[1,1,1,.6])

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
bpy.context.scene.render.resolution_x=720
bpy.context.scene.render.resolution_y=880
bpy.context.scene.render.resolution_percentage=100
bpy.context.scene.render.image_settings.file_format='PNG'
# Deterministic headless rendering: use Cycles CPU (does not require a GPU/display server).
bpy.context.scene.render.engine='CYCLES'
bpy.context.scene.cycles.device='CPU'
bpy.context.scene.cycles.samples=20
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
 'name':'Hanna v4 — reference-matched playable prototype',
 'art_contract':'character-v3/ART_DIRECTION_HANNA.md',
 'round':'R5-refined-model-playable',
 'format':'GLB (glTF 2.0)',
 'origin':'Blender-generated original geometry; no purchased/downloaded models',
 'license':'Original project asset for Casa da Hanna',
 'limitations':'Unrigged segmented meshes with animation pivots; aesthetic visual approval and physical-device performance remain pending',
 'nodes':len(all_assets),
 'meshes':sum(o.type=='MESH' for o in all_assets),
 'files':['hanna-v3.glb','hanna-front.png','hanna-threequarter.png','hanna-profile.png']
}
with open(os.path.join(OUT,'manifest.json'),'w') as f:json.dump(info,f,indent=2,ensure_ascii=False)
print('CHARACTER_BUILD_COMPLETE',json.dumps(info,ensure_ascii=False))
