Algebra(9,7,()=>{
  // http://vixra.org/abs/1905.0026    
  // Minimal 2D Cubic Conformal Geometric Algebra
  
  // plus and min blades, null basis, pseudo scalar.
  var plus = [1e03,1e04,1e05,1e06,1e07,1e08,1e09],
      min  = [1e10,1e11,1e12,1e13,1e14,1e15,1e16],
      [ei1,ei2,ei3,ei4,ei5,ei6,ei7]=2**-.5*(min+plus),
      [eo1,eo2,eo3,eo4,eo5,eo6,eo7]=2**-.5*(min-plus),
      EI = .5*(ei1+ei2), EO = eo1+eo2,
      I = 1e01020304050607080910111213141516;
   
  // cast an x,y point into the algebra. 
  var point = (x,y)=>x*1e01 + y*1e02 + .5*(x*x*ei1 + y*y*ei2) + x*y*ei3 + 
                     x*x*x*ei4 + x*x*y*ei5 + x*y*y*ei6 + y*y*y*ei7 + EO;
  
  // define a cubic equation
  var cubic = (a,b,c,d,e,f,g,h,i,j)=>(-(2*e*eo1+2*f*eo2+g*eo3+a*eo4+b*eo5+c*eo6+d*eo7)+h*1e01+i*1e02-j*EI)*I;

  // Use the symbolic evaluator to get the grade 1 layout of a point for the OPNS
  // renderer. (produces : ["x","y","x*x*0.707*0.5-0.707",...,"y*y*y*0.707"])
  var up = point(Element.Scalar('x'),Element.Scalar('y')).Vector;

  // Now that we have ALL that support code out of the way, create some cubics.  
  var circle = cubic(0,0,0,0,1,1,0,0,0,-1),
      cubic2 = cubic(1,-1,1,-1,0,0,0,0,0,-1);

  // Now graph a weighted sum of both:
  document.body.appendChild(this.graph(()=>{
    var t = Math.sin(performance.now()/1123)*.5+.5;
    var sum = t*circle + (1-t)*cubic2;
    return [0, sum ];
  },{up,animate:1}))
})
