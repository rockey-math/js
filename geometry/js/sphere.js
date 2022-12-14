
    Algebra(3,0,1,()=>{

    // Sampling random points (or directions) on a subspace or shape is an important component in any
    // modern rendering system. (where monte-carlo or quasi-monte-carlo integration techniques are used)
    
    // So lets visualise a variety of disc, hemisphere and sphere sampling routines to get a feel for what
    // they look like.
    
    var P = (x,y,z)=>1e123-x*1e012+y*1e013+(z||0)*1e023,       // Create a point.
        n = 0, a = 0, camera=0e0;                              // Our samplecount, algorithm count and camera position.

    // For visualisation purposes, its nice that the randoms are the same each run. 
    var rnd_map = [...Array(2048)].map(x=>Math.random()), rnd_count=0, rnd=()=>rnd_map[(rnd_count++)%rnd_map.length];    
        
    // sunflower sampling
    var disc_sunflower   = (i,n)=>{ i+=0.5; var r=(i/n)**0.5, t=Math.PI*(1+(5**0.5))*i; return P(r*Math.cos(t),r*Math.sin(t))},
        sphere_sunflower = (i,n)=>{ i+=0.5; var t=Math.PI*(1+(5**0.5))*i, p=Math.acos(1-2*i/n); return P(Math.cos(t)*Math.sin(p),Math.sin(t)*Math.sin(p),Math.cos(p))},
        hemi_sunflower   = (i,n)=>{ i+=0.5; var r=((i/n)**0.5), t=Math.PI*(1+(5**0.5))*i, x=Math.sin(r)*Math.cos(t), y=Math.sin(r)*Math.sin(t); return P(x,y,Math.sqrt(1-r**2))};
        
    // rejection sampling    
    var disc_reject   = ()=>{ var x=1,y=1; while((x*x+y*y) > 1) { x=rnd()*2-1; y=rnd()*2-1; }; return P(x,y); },
        sphere_reject = ()=>{ var x=1,y=1,z=1; while((x*x+y*y+z*z) > 1) { x=rnd()*2-1; y=rnd()*2-1; z=rnd()*2-1; }; var li = 1/Math.sqrt(x*x+y*y+z*z); return P(x*li,y*li,z*li); },
        hemi_reject   = ()=>{ var x=1,y=1,z=1; while((x*x+y*y+z*z) > 1) { x=rnd()*2-1; y=rnd()*2-1; z=rnd()*2-1; }; var li = 1/Math.sqrt(x*x+y*y+z*z); return P(x*li,y*li,Math.abs(z*li)); };
    
    // hammersley sampling (popular as easy to implement on GPU)
    var plane_hammersley = (i,n)=>{ return P((i/n)*2-1 ,radical_inverse(i)*2-1); },
        hemi_hammersley  = (i,n)=>{ var u=i/n, v=radical_inverse(i), p=v*2*Math.PI, ct=1-u, st=Math.sqrt(1-ct**2); return P(Math.cos(p)*st,Math.sin(p)*st, ct); };
     
    // Now graph it.    
    document.body.appendChild(this.graph( 
      ()=>{
      // figure out the pattern and samplecount.  
        n = (n+2)%750;            // increase samplecount.
        if (n==0) a=(a+1);        // cycle pattern.
      
      // select pattern.
        var pats = [disc_sunflower,hemi_sunflower,sphere_sunflower,plane_hammersley,hemi_hammersley,disc_reject,hemi_reject,sphere_reject], pat=pats[a%pats.length];  
        rnd_count=0; // reset random.

      // Rotate the camera.
        var time=performance.now()/4000; camera.set((1-1e03)*((pat.name.match(/disc|plane/))?1+1e13:Math.cos(time)+Math.sin(time)*1e13));
        
      // visualise the different patterns with increasing samplecount.   
        return [pat.name+' [n='+n+']'].concat([...Array(Math.max(10,n))].map((x,i)=>pat(i,n))) 
      }, {animate:true,grid:1,labels:1,camera}    
    ));

});

// Radical inverse : reflect a binary number around its decimal point. (generates for 0,1,2,3,4,... : 0,0.5,0.25,0.75,0.125,0.625,0.375,0.875,... )
var _ri=new Uint32Array(1), radical_inverse = (bits)=>{   
        _ri[0] = bits; 
        _ri[0] = ((_ri[0] & 0x0000ffff) << 16)| ((_ri[0] & 0xffff0000) >>> 16);
        _ri[0] = ((_ri[0] & 0x55555555) << 1) | ((_ri[0] & 0xAAAAAAAA) >>> 1);
        _ri[0] = ((_ri[0] & 0x33333333) << 2) | ((_ri[0] & 0xCCCCCCCC) >>> 2);
        _ri[0] = ((_ri[0] & 0x0F0F0F0F) << 4) | ((_ri[0] & 0xF0F0F0F0) >>> 4);
        _ri[0] = ((_ri[0] & 0x00FF00FF) << 8) | ((_ri[0] & 0xFF00FF00) >>> 8);
        return _ri[0] * 2.3283064365386963e-10;
    }
