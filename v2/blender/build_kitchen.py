"""Casa da Hanna — original rounded-furniture glTF pass R2.
Blender (free): bevelled/PBR architecture in Babylon world coordinates.
No third-party model, texture, font, image or paid service is used.
Run: blender --background --factory-startup --python build_kitchen.py
"""
import bpy, math, json, os, hashlib
from mathutils import Vector

bpy.ops.wm.read_factory_settings(use_empty=True)
OUT=os.path.abspath(os.path.join(os.path.dirname(__file__),'../assets'))
os.makedirs(OUT,exist_ok=True)

def color(h):
    h=h.lstrip('#')
    def linear(v):return ((v+0.055)/1.055)**2.4 if v>0.04045 else v/12.92
    return tuple(linear(int(h[i:i+2],16)/255.0) for i in (0,2,4))
def material(name,hex,rough=.78,metal=0):
    m=bpy.data.materials.new(name);m.diffuse_color=(*color(hex),1)
    m.use_nodes=True;p=m.node_tree.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value=(*color(hex),1)
    p.inputs['Roughness'].default_value=rough
    p.inputs['Metallic'].default_value=metal
    return m
mat={
'ivory':material('Ivory enamel','#FFF3E8',.42),
'sage':material('Sage cabinetry','#9EAF9F',.67),
'sageDeep':material('Sage inset','#718878',.72),
'sageLight':material('Mint cream cabinetry','#CAD7C1',.63),
'oak':material('Honey oak wood','#BD8A62',.64),
'oat':material('Pale oak grain','#E8C5A1',.7),
'oakDark':material('Walnut edging','#90604E',.62),
'stone':material('Cream quartz','#F7EFE4',.24),
'metal':material('Brushed champagne bronze','#CFA26F',.26,.58),
'pink':material('Blush upholstered fabric','#E9C3B1',.95),
'glass':material('Blue glass','#92BDC7',.21,.11),
'black':material('Graphite hob','#474A47',.32,.2),
'porcelain':material('White porcelain','#FBF8F2',.26),
'leaf':material('Sage leaves','#779976',.95),
'leafLight':material('Olive leaves','#A0B088',.92),
'rose':material('Coral flower','#E6A69D',.84)
}
objs=[]
def location(p):return (p[0],-p[2],p[1])
def add_bevel(o,amount,segments=3):
    bpy.context.view_layer.objects.active=o
    bevel=o.modifiers.new('Furniture soft edges','BEVEL')
    bevel.width=amount;bevel.segments=segments
    bevel.affect='EDGES' if hasattr(bevel,'affect') else None
    bevel.limit_method='ANGLE'
    normal=o.modifiers.new('Weighted normals','WEIGHTED_NORMAL')
    normal.keep_sharp=True;normal.weight=35
def cube(n,pos,dim,ma,bevel=0.025):
    bpy.ops.mesh.primitive_cube_add(size=1,location=location(pos))
    o=bpy.context.object;o.name=n
    o.dimensions=(dim[0],dim[2],dim[1])
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    o.data.materials.append(ma)
    if bevel:add_bevel(o,bevel)
    objs.append(o)
    return o
def cylinder(n,pos,diam,height,ma,vertices=48,bevel=.022):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices,radius=diam/2,depth=height,location=location(pos))
    o=bpy.context.object;o.name=n;o.data.materials.append(ma)
    if bevel:add_bevel(o,bevel,4)
    objs.append(o);return o
def ellipsoid(n,pos,diameter_xyz,ma):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=20,ring_count=12,location=location(pos))
    o=bpy.context.object;o.name=n
    o.scale=(diameter_xyz[0]/2,diameter_xyz[2]/2,diameter_xyz[1]/2)
    o.data.materials.append(ma)
    for f in o.data.polygons:f.use_smooth=True
    objs.append(o);return o
def tube(n,points,radius,ma):
    cu=bpy.data.curves.new(n,'CURVE');cu.dimensions='3D';cu.resolution_u=16;cu.bevel_depth=radius;cu.bevel_resolution=3
    sp=cu.splines.new('POLY');sp.points.add(len(points)-1)
    for i,p in enumerate(points):sp.points[i].co=(*location(p),1)
    o=bpy.data.objects.new(n,cu);bpy.context.collection.objects.link(o);o.data.materials.append(ma)
    objs.append(o);return o

# Cabinet run — rounded fronts, built-in recesses and one continuous stone slab.
cube('B2_counter_carcase',(.62,.53,2.16),(5.83,.88,.77),mat['sage'],.095)
cube('B2_toekick',(.62,.115,1.87),(5.78,.16,.56),mat['sageDeep'],.032)
cube('B2_quartz_slab',(.62,1.09,2.07),(5.93,.135,1.07),mat['stone'],.057)
cube('B2_oak_counter_lip',(.62,1.015,2.05),(5.94,.035,1.09),mat['oak'],.016)
for i in range(6):
    x=-1.84+.93*i
    cube('B2_door_{}'.format(i),(x,.55,1.72),(.80,.75,.08),mat['sageLight'] if i%2 else mat['sage'],.048)
    cube('B2_door_recess_{}'.format(i),(x,.55,1.67),(.66,.61,.019),mat['sage'] if i%2 else mat['sageLight'],.026)
    cylinder('B2_pull_{}'.format(i),(x+.22,.63,1.623),.055,.06,mat['metal'],24,.009)
# Fridge casing; the animated door remains in Babylon for reliable mission state.
cube('B2_fridge_enclosure',(-2.95,1.145,2.08),(1.23,2.27,.89),mat['ivory'],.095)
cube('B2_fridge_side',(-2.32,1.12,2.085),(.048,2.20,.84),mat['sage'],.02)
cube('B2_fridge_top',(-2.95,2.302,2.08),(1.28,.076,.95),mat['sageLight'],.03)
cube('B2_fridge_base',(-2.95,.07,2.05),(1.26,.12,.93),mat['sageDeep'],.025)
# Shallow sink, framed brass rim and curved faucet.
cube('B2_sink_rim',(-.98,1.167,2.00),(1.04,.029,.59),mat['metal'],.065)
cube('B2_sink_steel',(-.98,1.183,2.00),(.91,.023,.50),mat['black'],.056)
cube('B2_sink_porcelain',(-.98,1.198,2.00),(.74,.018,.35),mat['porcelain'],.055)
tube('B2_faucet_arc',[(-1.38,1.18,2.29),(-1.38,1.43,2.29),(-1.32,1.56,2.28),(-1.15,1.60,2.24),(-1.04,1.55,2.23),(-1.04,1.42,2.23)],.027,mat['metal'])
cylinder('B2_faucet_base',(-1.38,1.21,2.29),.11,.07,mat['metal'])
# Graphite stovetop / integrated oven with premium trim.
cube('B2_hob', (2.4,1.177,1.96),(1.05,.037,.67),mat['black'],.035)
for i,(x,z) in enumerate([(2.14,1.77),(2.66,1.77),(2.14,2.14),(2.66,2.14)]):
    cylinder('B2_burner{}'.format(i),(x,1.203,z),.23,.008,mat['metal'],32,.002)
    cylinder('B2_burner_center{}'.format(i),(x,1.209,z),.135,.008,mat['black'],32,.002)
cube('B2_oven_face',(2.39,.46,1.653),(.94,.57,.07),mat['black'],.052)
cube('B2_oven_glass',(2.39,.46,1.605),(.79,.41,.01),mat['glass'],.028)
cube('B2_oven_handle',(2.39,.76,1.579),(.67,.031,.055),mat['metal'],.014)
# Three centered upper cupboards with smooth inset and bronze round knobs.
for i,x in enumerate((1.12,2.16,3.20)):
    cube('B2_upper_frame{}'.format(i),(x,2.51,2.70),(.93,.89,.39),mat['sage'],.045)
    cube('B2_upper_front{}'.format(i),(x,2.51,2.463),(.85,.76,.055),mat['sageLight'],.06)
    cube('B2_upper_inset{}'.format(i),(x,2.51,2.426),(.73,.64,.015),mat['ivory'],.038)
    ellipsoid('B2_upper_knob{}'.format(i),(x+.31,2.30,2.402),(.084,.084,.06),mat['metal'])
cube('B2_upper_crown',(2.17,2.99,2.57),(3.05,.11,.48),mat['oak'],.035)
# Breakfast table: thick oval top with three chamfered sections.
for name,y,dia,height,ma in [('B2_table_under',.864,2.07,.09,'oak'),('B2_table_oak',.927,2.04,.15,'oat'),('B2_table_quartz',1.016,1.94,.026,'stone')]:
    o=cylinder(name,(-.09,y,-.71),dia,height,mat[ma],64,.045 if height>.07 else .011)
    o.scale.y=.61 # Blender horizontal y = Babylon depth z
cylinder('B2_table_pedestal',(-.09,.48,-.71),.34,.83,mat['oak'],32,.04)
cube('B2_table_foot_x',(-.09,.095,-.71),(1.25,.13,.24),mat['oat'],.055)
cube('B2_table_foot_z',(-.09,.095,-.71),(.24,.13,.8),mat['oat'],.055)
# Chairs with sculpted upholstered seats and backs; softened edges.
for x,side in [(-1.55,-1),(1.39,1)]:
    idx='L' if side==-1 else 'R'
    cube('B2_chair_seat_'+idx,(x,.49,-.69),(.55,.14,.59),mat['oak'],.052)
    ellipsoid('B2_chair_padded_seat_'+idx,(x,.585,-.69),(.52,.15,.56),mat['pink'])
    cube('B2_chair_back_'+idx,(x+side*.23,.97,-.69),(.10,.81,.65),mat['oak'],.065)
    ellipsoid('B2_chair_back_cushion_'+idx,(x+side*.255,1.07,-.69),(.17,.67,.55),mat['sageLight'])
    for j,zz in enumerate((-.91,-.47)):
        for xx in (x-side*.16,x+side*.22):
            cube('B2_chair_leg_%s_%s_%s'%(idx,j,xx), (xx,.245,zz),(.075,.45,.08),mat['oak'],.025)
# Additional small rounded kitchen props show hand-crafted details.
ellipsoid('B2_vase_glazed',(.48,1.18,-.48),(.22,.33,.21),mat['ivory'])
tube('B2_floral_stem',[(.48,1.38,-.48),(.50,1.54,-.49),(.53,1.63,-.49)],.016,mat['leaf'])
for i in range(5):
    a=i*2*math.pi/5
    ellipsoid('B2_flower_petals{}'.format(i),(.53+math.cos(a)*.063,1.67,-.49+math.sin(a)*.063),(.095,.06,.085),mat['rose'])
# Never export cameras/lights: PWA runtime owns quality profiles, shadows, interaction logic.
bpy.ops.object.select_all(action='DESELECT')
for o in objs:
    o.select_set(True)
bpy.context.view_layer.objects.active=objs[0]
target=os.path.join(OUT,'kitchen-architecture-r2.glb')
bpy.ops.export_scene.gltf(filepath=target,export_format='GLB',use_selection=True,export_apply=True,export_cameras=False,export_lights=False)
digest=hashlib.sha256(open(target,'rb').read()).hexdigest()
meta={'author':'Casa da Hanna project','source':'original procedural Blender geometry','license':'CC0-1.0','meshes':len(objs),'sha256':digest,'size':os.path.getsize(target),'engine':'Blender'}
with open(os.path.join(OUT,'kitchen-architecture-r2.json'),'w') as f:json.dump(meta,f,indent=2)
print('HANNA_KITCHEN_R2_EXPORTED',json.dumps(meta))
