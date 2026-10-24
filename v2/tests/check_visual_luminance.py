"""A dependency-free visual gate for real WebGL screenshots, not mockups.
Measure screen luminance from 8-bit non-interlaced RGB/RGBA PNG using stdlib.
Catch post-process regressions that turn the kitchen nearly black.
"""
import sys,struct,zlib,pathlib
def check(path):
    data=pathlib.Path(path).read_bytes()
    assert data[:8]==b'\x89PNG\r\n\x1a\n', 'not a PNG'
    pos=8; compressed=[];width=height=ctype=bits=0
    while pos<len(data):
        size=struct.unpack_from('>I',data,pos)[0];kind=data[pos+4:pos+8];payload=data[pos+8:pos+8+size]
        pos+=12+size
        if kind==b'IHDR':
            width,height,bits,ctype,compression,fmode,interlace=struct.unpack('>IIBBBBB',payload)
            assert bits==8 and ctype in (2,6) and interlace==0,('unsupported PNG',bits,ctype)
        if kind==b'IDAT':compressed.append(payload)
        if kind==b'IEND':break
    channels=4 if ctype==6 else 3
    raw=zlib.decompress(b''.join(compressed));stride=width*channels
    prev=bytearray(stride);at=0;sum_rgb=0;count=0
    # every 12th row; exclude outer 8% margin and upper HUD band (top 24%)
    for y in range(height):
        filt=raw[at];at+=1
        row=bytearray(raw[at:at+stride]);at+=stride
        for i in range(stride):
            left=row[i-channels] if i>=channels else 0
            above=prev[i];upperleft=prev[i-channels] if i>=channels else 0
            if filt==1: row[i]=(row[i]+left)&255
            elif filt==2: row[i]=(row[i]+above)&255
            elif filt==3: row[i]=(row[i]+((left+above)//2))&255
            elif filt==4:
                p=left+above-upperleft;pa=abs(p-left);pb=abs(p-above);pc=abs(p-upperleft)
                row[i]=(row[i]+(left if pa<=pb and pa<=pc else above if pb<=pc else upperleft))&255
            elif filt!=0: raise ValueError('Unexpected PNG row filter')
        if int(height*.24)<y<int(height*.92) and y%12==0:
            for x in range(int(width*.10),int(width*.88),6):
                i=x*channels;sum_rgb+=row[i]*.2126+row[i+1]*.7152+row[i+2]*.0722;count+=1
        prev=row
    average=sum_rgb/max(1,count)
    print('TRUE_SCREEN_LUMA',path,{'width':width,'height':height,'mean_luma':round(average,1)})
    assert average>110,('REAL_SCENE_TOO_DARK',round(average,1),path)
for file in sys.argv[1:]:check(file)
