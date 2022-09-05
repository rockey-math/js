// 3D PGA Motor Skinning and Animation Blending example.
// 
// This example showcases the use of PGA motors for both animating and skinning.
// blending is done between animation frames, and between several animations.
//
// by enki.

//First load our data and pass it to a PGA algebra.
fetch("../rsc/jimmy_anim.json").then(x=>x.json()).then(Algebra(3,0,1).inline((obj)=>{
 
  // our json contains both mesh and animation data.
  // obj = { vertices:[x,y,z,x,y,z,....], triangleIndices:[0,1,2,...], 
  //         weights:[w1,w2,w3,w4,w1,w2,...], boneIndices:[b1,b2,b3,b4,b1,b2,...],
  //         bones:[{name,parent,position,rotation,anim:[[h,p,b],[h,p,b],...]}]}

  // Shortcuts and helpers
  const {E,PI}  = Math;
  const fromHPB = ([h,p,b]) => E**(-h*.5e31)*E**(-p*.5e23)*E**(-b*.5e12);
  const fromXYZ = (xyz=[0,0,0]) => E**(-.5e0*[1e1,1e2,1e3]*xyz);
  const blend   = (b,f1,f2,t=f1%1)=>b.anim[f1|0]*(1-t) + t*b.anim[f2|0];
  
  // Find total rotor of given bone. (including parents transforms)
  var totR = (b)=>b.parent?totR(b.parent)*b.rotor:b.rotor;
  
  // Resolve bone parenting, convert all pos/rot/anim to rotor format.
  obj.bones.forEach((b,i)=>{
    b.parent   = obj.bones.find(c=>c.name==b.parent);       // parents come in with name, find matching bone object
    b.orig     = fromXYZ(b.position)*fromHPB(b.rotation);   // bind position/rotation to local motor
    b.rotor    = b.orig+0e1;                                // current position/rotation as local motor
    b.bindPose = ~totR(b);                                  // total bindPose takes bone to origin
    b.boneTransform = 1+0e1;                                // current total transform (start from identity as MV)
    b.anim = b.anim.map((x,i)=>b.orig*fromXYZ(b.animT[i])*fromHPB(x)); // convert animation data to rotors.
  })

  // Get vertices as PGA points. 4 weights and 4 bone rotors per vertex also
  var vcount  = obj.vertices.length / 3;
  var spoints = [...Array(vcount)].map((x,i)=>!(1e0 + [1e1,1e2,1e3]*obj.vertices.slice(i*3,i*3+3)));
  var weights = [...Array(vcount)].map((x,i)=>obj.weights.slice(i*4,i*4+4));
  var bones   = [...Array(vcount)].map((x,i)=>obj.boneIndices.slice(i*4,i*4+4).map(i=>obj.bones[i].boneTransform));

  // Now animate and graph.
  var c = document.body.appendChild(this.graph(()=>{
    // first animation is always the walk, find its current frame
    var f1 = (performance.now()/1500*30)%33;  // walk frames 0->33
    
    // pick second animation make it run in sync with first and find its current frame
    // we've got 'jump', 'run', 'stride', 'idle', 'zombie'
    var [start,len,ofs] = [[57,122-57,0],[34,56-34,0],[124,162-124,20],[164,218-164,0],[219,283-219,0]][(performance.now()/10000|0)%5]
    var f2 = (((f1/33*len)+ofs)%len)+start;     
    
    // beta is the mixing factor between the two animations     
    var beta = Math.cos(performance.now()/5000*Math.PI)*0.5+0.5;
    
    // now update all bone rotors to blend between these animations and their frames
    obj.bones.forEach((b,i)=>{
      // blend animations and update local rotors.
      b.rotor.set(beta*blend(b,f1,(f1+1)%33)+(1-beta)*blend(b,f2,((f2+1-start)%len)+start)); 
      // set total bone transform. (move restpose bone to origin, then to current pos/rot)
      b.boneTransform.set(totR(b)*b.bindPose);
    })
    
    // PGA rotor blending in the group. (ala dquats .. blend bones, then apply once)
    // bones[i] is an array of four rotors, weights[i] is an array of four scalars.
    var points = spoints.map((p,i)=>bones[i]*weights[i] >>> p);

    // return elements to render.
    return [0xffa200, { transform : (1 - 1e02)*E**(1.57e31), data : points, idx  : obj.triangleIndices }]
  },{ gl:1, h : -0.2, p:-0.15, grid:1, animate:1 })); 
  c.style.width=c.style.height='100%'; document.body.style.overflow='hidden';
  
}));
