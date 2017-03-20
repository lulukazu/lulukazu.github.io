//item navigation
var allData = [];

var currentID="physics";
var photoActive=0;
// Variables for the visualization instances

queue()
    .defer(d3.json,"data/fileNodesAndLinks.json")
    .defer(d3.json,"data/photoData.json")
    .await(createVis);

var colors={ "physics":'#DDE8E0',
    "projects":'#749CA8',
    "writing":'#F9E0A8',
    "photography":'#D16B54',
    "hobbies":'#8B8378'};

var colors_arr=['#DDE8E0', '#749CA8', '#F9E0A8', '#D16B54', '#8B8378','#DDE8E0', '#749CA8', '#F9E0A8', '#D16B54', '#8B8378'];
var defaultTour=0;


function closeAll(){
  closeNav();
  var parentEl=d3.select("#content-div");
  var nodes = parentEl.selectAll(".node");
  nodes.style("opacity", 0).remove();
  $('.div-line').remove();

  var tourArea=document.getElementById('photo-tour-area');
  photoActive=defaultTour;
  isclicked=defaultTour;
      d3.select(tourArea)
      .attr("data","");
  document.getElementById("photos-div-wrapper").style['display']="none";


}

function updateNav(id){
    closeAll();
    document.getElementById("nav-button-"+currentID).style['background-color']="";
    document.getElementById("nav-text-"+currentID).style['background-color']="";
    document.getElementById("nav-button-"+id).style['background-color']=colors[id];
    document.getElementById("nav-text-"+id).style['background-color']="rgba(255,255,255,.3)";

    displayUpdate(id);
}

function displayUpdate(id){

  if (id=="photography"){
    document.getElementById(currentID+"-nav").style.display="none";
    setTimeout(function(){
      updatePhotos();
      currentID=id;
    },300);

  }  else {
      document.getElementById("content-wrapper").style['display']="block";


      setTimeout(function(){
        document.getElementById(currentID+"-nav").style.display="none";
        document.getElementById(id+"-nav").style.display="block";
        currentID=id;
        openNav();
      },300);

      }

}


function updatePhotos(){
      console.log(document.getElementById("photos-div-wrapper").style['display'])
      document.getElementById("photos-div-wrapper").style['display']="block";

      document.getElementById("content-wrapper").style['display']="none";


      var parentEl=d3.select("#photo-nav-dots")
      var photoNodes = parentEl.selectAll(".pnode")
          .data(photosData,function(d){
            return d.id;});

      photoNodes.exit()
          .style("opacity", 0).remove();

      //enter
      isclicked=defaultTour;
      var w=diameter_dots;
      var w2=diameter_dots_highlighted
      var r=w/2;
      var r2=w2/2;
      var dots_containers=photoNodes.enter()
          .append("div").attr("class","pnode_container")
          .style("top",function(d,i){
            var disp=i*50;
            return disp+"px";
          })
          .style("width",w2+"px")
          .style("height",w2+"px");

          var dots=dots_containers
          .append("div")
          .attr("class","pnode")
          .style("border",function(d,i){
                      return "2px solid "+colors_arr[i];
                    })
          .on("click",function(d,i){
            //highlight current node
            updateTour(d.num);
            isclicked=i;
            //de-highlight other inactive nodes
            //??
          })
          .on("mouseover", function(d,i){

            if (isclicked==i){

            } else {
            d3.select(this)
                .style("background-color", function(){
                  //return colors_arr[i];
                  return "#fff"
                })
                .transition()
                .duration(250)
                .style("width", w2+"px")
                .style("height",w2+"px")
                .style("border-radius", r2+"px");
              }
          })
          .on("mouseout", function(d,i){

            if (isclicked==i){

            } else {
            d3.select(this)
                .style("background-color", function(){
                  return "#fff";})
                .transition()
                .duration(100)
                .style("width", w+"px")
                .style("height", w+"px")
                .style("border-radius", r+"px");
              }
            });

          parentEl.style("transform", function(d,i){
            var translateAmount=(photosData.length)*50/2+w/2;
            return "translate(0px,-"+translateAmount+"px)";
          });
          updateTour(defaultTour);
  }

var diameter_dots=20;
var diameter_dots_highlighted=30;


function highlightNode(id){
  var pnodes=d3.selectAll('.pnode');
  var w=diameter_dots;
  var w2=diameter_dots_highlighted;
  var r=w/2;
  var r2=w2/2;

  pnodes.transition()
  .duration(200).style("background-color",function(d,i){
    if (d.num==id){
      return colors_arr[i];
    } else {
      return "#fff"
    }
  })
  .style("width", function(d,i){
    if (d.num==id){
      return w2+"px";
    } else {
      return w+"px"
    }
  })
  .style("height", function(d,i){
    if (d.num==id){
      return w2+"px";
    } else {
      return w+"px"
    }
  })
  .style("border-radius", function(d,i){
    if (d.num==id){
      return r2+"px";
    } else {
      return r+"px"
    }
  })

}


function updateTour(tourIndex){
  var tourArea=document.getElementById('photo-tour-area');
  var svgLink=photosData[tourIndex].link;
  photoActive=0;

  var defer = $.Deferred();

  var a = function() {
    var defer = $.Deferred();
    setTimeout(function() {
        d3.select(tourArea)
        .style("opacity",0)
        .attr("data",svgLink);
        defer.resolve(); // When this fires, the code in a().then(/..../); is executed.
    }, 100);

    return defer;
  };

  var b = function() {
      var defer = $.Deferred();
      setTimeout(function () {
          assignZoom(tourArea);
          defer.resolve();
      }, 100);

      return defer;
  };
  //var allImages=d3.select("#photo-tour-area").selectAll("image");
  //console.log(allImages);

  a().then(b);

  highlightNode(tourIndex);

}

var imageIndex=0;
var allImages=[];


function assignZoom(tourArea){
      //document.getElementById("photos-div-wrapper").style['display']="block";
      //controls zoom behavior on loaded image

      d3.select(tourArea)
      .transition()
      .duration(700)
      .style("opacity",1);

      var subdoc = tourArea.contentDocument;
      var svgEl=d3.select(subdoc).select("svg");
      var subG=d3.select(subdoc).select("g");

      //subG element has transform attributes which are horrible, need to get them
      var xforms = subG.attr('transform');
      var parts  = /translate\(\s*([^\s,)]+)[ ,]([^\s,)]+)/.exec(xforms);
      var firstX = parts[1], firstY = parts[2];

      var content = subG.html();
      subG.html('');
      svgEl.html('');

      var zoomer = svgEl.append('g')
        .attr('class', 'zoomer1')
        .html(content);

      var svgMax=300;


      //get current x,y positions of images

      allImages1=d3.select(subdoc).selectAll('image')
      .attr("x",function(d,i){
        var currentX=d3.select(this).attr("x");
        return parseFloat(currentX)+parseFloat(firstX);
      })
      .attr("y",function(d,i){
        var currentY=d3.select(this).attr("y");
        return parseFloat(currentY)+parseFloat(firstY);
      })
      .on("mouseover",function(){
        d3.select(this).style("cursor","pointer");
      })
      .on("click",function(d,i){
        var thisImage=d3.select(this);
        console.log(thisImage)
        clickOn(thisImage,svgMax,zoomer,naviLeft,naviRight,i);
      })

      allImages=allImages1[0];



//navigation
      var naviRight=svgEl.append('g')
      .attr('class','arrowG')
      .style('opacity',0);

      var naviLeft=svgEl.append('g')
      .attr('class','arrowG')
      .style('opacity',0);




      naviRight.append('polygon')
      .attr('points','298,150 293,145 293,155')
      .attr('id','arrowright')
      .style('fill','#ccc')
      .style('stroke','none')
      .on('mouseover',function(d,i){
        d3.select(this).style('fill','#000');
        d3.select(this).style('cursor','pointer');
      })
      .on('mouseout',function(d,i){
        d3.select(this).style('fill','#ccc')
      })
      .on('click',function(d,i){
        var currentImage=imageIndex;
        var nextImage=(((currentImage+1)%allImages.length)+allImages.length)%allImages.length;

        var nextImageObject=d3.select(allImages[nextImage]);
        clickOn(nextImageObject,svgMax,zoomer,naviLeft,naviRight,nextImage);
      });

      naviLeft.append('polygon')
      .attr('points','2,150 7,145 7,155')
      .attr('id','arrowleft')
      .style('fill','#ccc')
      .style('stroke','none')
      .on('mouseover',function(d,i){
        d3.select(this).style('fill','#000');
        d3.select(this).style('cursor','pointer');
      })
      .on('mouseout',function(d,i){
        d3.select(this).style('fill','#ccc')
      })
      .on('click',function(d,i){
        var currentImage=imageIndex;
        var nextImage=(((currentImage-1)%allImages.length)+allImages.length)%allImages.length;

        var nextImageObject=d3.select(allImages[nextImage]);
        clickOn(nextImageObject,svgMax,zoomer,naviLeft,naviRight,nextImage);
      });



      // svgEl.html('');
      //subG.attr('transform','');
      //
      // var zoomer = svgEl.append('g')
      //   .attr('class', 'zoomer')
      //   .html(content);
      svgEl.attr("viewBox","0 0 "+svgMax+" "+svgMax);

        svgEl.on("click",function(){
          var isOnBackground = d3.event.target.tagName == 'svg';

          if (isOnBackground) {
          zoomer.transition()
            .duration(750)
            .attr("transform", "translate(" + [0,0] + ")scale(" + 1 + ")");
            photoActive=0;
          naviLeft
            .style('opacity',0);
          naviRight
            .style('opacity',0);

          }
        })
        //dimensions of bounding box of g element



      // end zoom behavior
  }


function clickOn(thisImage,svgMax,zoomer,naviLeft,naviRight,index) {
  var currentX=thisImage.attr("x");
  var currentY=thisImage.attr("y");
  var currentWidth=thisImage.attr("width");
  var currentHeight=thisImage.attr("height");

  var scale = .9 / Math.max(currentWidth / svgMax, currentHeight / svgMax);
  center_x=(parseFloat(currentX) + parseFloat(currentWidth)*.5)*scale; // relative to svg left top
  center_y=(parseFloat(currentY) + parseFloat(currentHeight)*.5)*scale; // relative to svg left top
  var translate=[-center_x + svgMax/2,-center_y + svgMax/2];



  if (photoActive==0 || index!=imageIndex){
  zoomer.transition()
    .duration(750)
    .attr("transform", "translate(" + translate + ")scale(" + scale + ")");
    // insert buttons for left right navigation here?
    photoActive=1;
  naviLeft.transition()
  .duration(750).style('opacity',1);
  naviRight.transition()
  .duration(750).style('opacity',1);

  } else {
    zoomer.transition()
      .duration(750)
      .attr("transform", "translate(" + [0,0] + ")scale(" + 1 + ")");
      naviLeft.style('opacity',0);
      naviRight.style('opacity',0)
    photoActive=0;
  }

  imageIndex=index;
}


function openNav() {
    document.getElementById("nav-box").style.left = "0px";
}

function closeNav() {

    document.getElementById("nav-box").style.left = "500px";
}



function createVis(error,data1,data2) {
    // Create an object instance
    allData=data1;
    photosData=data2;
}

function wrangleData(itemID){
    updateFiles("content-div",allData,itemID);
}



function updateFiles(parentID,data,itemID) {

    //link data
    var parentEl=d3.select("#"+parentID);

    var line=parentEl.append("div")
        .attr("class","div-line")
        .style("width","3px")
        .style("height","100vh")
        .style("background-color","#444")
        .style("position","fixed");

    var nodes = parentEl.selectAll(".node")
        .data(data[itemID],function(d){return d.id;});

    //exit
    nodes.exit()
        .style("opacity", 0).remove();



    //enter
    var divs=nodes.enter()
        .append("div")
        .attr("class","node row");


    divs.attr("style",function(d){
            //var randRange=80;
            //var leftDisp=Math.random();
            //while (Math.abs(lastDisp-leftDisp)<0.4){
            //    leftDisp=Math.random();
            //}
            //lastDisp=leftDisp;

            //return "left:"+leftDisp*randRange+"px; top:-1000px; display: hidden;";
            return "left:50px; top:-400px; display: hidden;";
        })
        .transition()
        .duration(1000)
        .attr("style",function(d){
                return "left:50px; top:"+d.num*40+"px; display: inline-flex;";
            })
;

    //window.open('page.html','_newtab')

    divs.append('img')
        .style('position', 'absolute')
        .style('width', 0)
        .attr('src', function(d) { return d.img; });

    var dots=divs.append("div")
        .attr("class","dot")
        .style("border",function(d,i){
            return "2px solid "+colors_arr[i];
        });

    /*var plusSign=dots.append("div")
        .attr("class","glyphicon glyphicon-plus")
        .style("color",function(d,i){
            return colors_arr[i];
        });*/

    divs
        .on("mouseover",function(d,i){
            var w= d.r*2;
            var h= d.r*2;
            var w2=w*1.2;

            var t1= d.r/2;
            var offsets =$(this).select('.dot').offset();
            var top = offsets.top- d.r;
            var left = offsets.left- d.r;
            d3.select(this).select('.dot')
                .style("background", "url("+ d.img+") no-repeat")
                .style("background-size",w2+"px")
                .transition()
                .duration(400)
                .style("width", w+"px")
                .style("height",w+"px")
                .style("border-radius", d.r+"px")
                .style("border","")
                .style("left","-"+t1+"px")
                .style("top","-"+t1+"px");
            /*d3.select(this)
                .selectAll("div")
                .style("display","none");*/

        })
        .on("mouseout",function(d,i){
            var w= d.r*2;
            var h= d.r*2;

            var t1= d.r/2;
            var colorhere=colors_arr[i];
            d3.select(this).select('.dot')
                .transition()
                .duration(300)
                .style("background", colorhere)
                .style("border","2px solid "+colorhere)
                .style("width", "20px")
                .style("height","20px")
                .style("border-radius","10px")
                .style("left","0px")
                .style("top","0px");
        })
        .on("click",function(d){
            switch (d.type) {
                case "file":
                    window.open(d.link, '_newtab');
                    break;
                case "video":
                    var src = d.link;
                    var text= d.videotext;
                    modal.style.display = "block";
                    modal.style.width='auto';
                    modal.style.height='auto';
                    $('#myModal iframe').attr('src', src);
                    $('#myModal p').html(text);
                    break;
                case "recipes":

                    if ( $( "#svg-id" ).length ) {
                        $("#svg-id").remove();
                    }

                    modal_recipes.style.display = "block";
                    modal_recipes.style.width='auto';
                    modal_recipes.style.height='auto';
                    queue().defer(d3.csv,"data/recipes_sampled.csv")
                        .defer(d3.json,"data/categories.json")
                        .await(createVisRecipes);
                    break;
                case "page":
                    modal_page.style.display = "block";
                    var container=document.getElementById("modal-container");
                    var img = document.createElement("img");
                    if ( $( "#image-id" ).length ) {
                    $("#image-id").remove();
                    }
                    img.src=d.link;
                    img.class="page-image";
                    img.id="image-id";
                    img.style.width="80%"
                    container.appendChild(img);

                    break;
            }

        });


    divs.append("img")
        .attr("src",function(d){return d.img;})
        .attr("class","node-image col-sm-5")
        .attr("style",function(d) {
            return "height:"+2*d.r+"px; " +"width:"+ 2*d.r+"px";});

    divs.append("div")
        .html(function(d){
            return d.text;
        })
        .attr("class","node-text col-sm-7");



    //modal javascript


}


// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];
var span2 = document.getElementById("span2");
var span3 = document.getElementById("span3");
var modal = document.getElementById('myModal');
var modal_page=document.getElementById('pageModal');
var modal_recipes=document.getElementById('forceModal');
//
// When the user clicks on <span> (x), close the modal
span.onclick = function() {
    $('#myModal iframe').removeAttr('src');
    modal.style.display = "none";
};

span2.onclick=function(){
    modal_recipes.style.display = "none";
};

span3.onclick=function(){
    modal_page.style.display = "none";
};

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal  || event.target == modal_recipes || event.target==modal_page) {
        modal.style.display = "none";
        modal_recipes.style.display = "none";
        modal_page.style.display="none";
    }
};
