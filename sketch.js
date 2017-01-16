p5.disableFriendlyErrors = true;


const isdebug = 0;
const KGROUPS = 16;
const MAX_ITR = 40;
const MAX_INT = 999;
var canvas;
var colors;
//Image user preloaded, used to determine the size of the canvas
var img;

function debug(t){
	if(isdebug == 1){
		console.log(t);
	}
}

function optFloor(x){return x << 0;}

function preload(){
    img = loadImage("assets/test.jpg");
}

function createColorHash(img){
    var ret = {};
    img.loadPixels();    
    for(var p = 0; p < img.width*img.height; p++){
        ret[p] = color(img.pixels[0 + 4*p], img.pixels[1 + 4*p], img.pixels[2 + 4*p]);   
    }
    debug("Custom Color: R: " + red(ret[2]) + "G: " + green(ret[2])+ " B: "+ blue(ret[2]));
    return ret;
}

function getRandomColor(){
    return color(Math.random()*256,Math.random()*256,Math.random()*256);
}

function createNexuses(){
    //debug("RANDOMIZING NEXUSES")
    var ret = new Array(KGROUPS);
    for(var c = 0; c < KGROUPS; c++){
        ret[c] = getRandomColor();
	//debug("R: " + red(ret[c]) + " B: " + blue(ret[c]) + " G: " + green(ret[c]))
    }
    return ret;
}
function calcColorDist(nexus, pixel){
    var h = Math.pow(hue(nexus) - hue(pixel),2);
    var s = Math.pow(saturation(nexus) - saturation(pixel),2);
    var b = Math.pow(brightness(nexus) - brightness(pixel),2);
    return Math.sqrt(h + s + b);
}
function relabelPixels(nexuses, img){
    //debug("relabeling pixels")
    //Each index will store on Color Object
    var ret = new Array(img.width*img.height);
    for(var p = 0; p < img.width*img.height; p++){
        
        var curPixel = colors[p];  
        var bestNexus = 0;
        var bestDist = MAX_INT;

        for(var n = 0; n < nexuses.length; n++){
            var newDist = calcColorDist(nexuses[n], curPixel);
            if(newDist < bestDist){
                bestNexus = n;
                bestDist = newDist;
            }
        }
        ret[p] = bestNexus;
    }   
    //debug("retcol: " + red(ret))
    return ret;
}

function averageLabels(nexuses, img, labels){
    //debug("AVERAGING LABELS")
    var ret = new Array(nexuses.length);
    for(var n = 0; n < nexuses.length; n++){
        var count = 0.0;
        var r = 0;
        var g = 0;
        var b = 0;
        for(var p = 0; p < img.width*img.height; p++){
            var curColor = colors[p];
            if(labels[p] == n){
                count++;
                r+=red(curColor);
                g+=green(curColor);
                b+=blue(curColor);
            }
        }
        //debug("red: " + (r/count) + " green: "+ (g/count) +" blue: " +  (b/count))
	ret[n] = color(r/count,g/count,b/count);
    }
    return ret;
}

function checkValidPixels(img){
    debug("Checking Pixels")
    for(var x = 0; x < img.width*img.height; x++){
   	    debug("R "+ img.pixels[x] + " g: " + img.pixels[x+1] + " b: " + img.pixels[x+2] + " a: " + img.pixels[x+3]);
    }
    return true;
}

function kmeans(img){
    //debug("Begin KMEANS")
    var nexuses = createNexuses();
    var ret = new p5.Image(img.width,img.height);
    var labels = new Array(img.width*img.height);
    img.loadPixels();
    ret.loadPixels();
    for(var i = 0; i < MAX_ITR; i++){
        //relabel pixels based on nexuses
        labels = relabelPixels(nexuses, img);
        //Remap nexuses 
        nexuses = averageLabels(nexuses, img, labels);
        console.log(i);
    }
    debug("Setting Pixels")    
    for(var x = 0; x < img.width*img.height; x++){
        var rx = x % img.width
        var ry = optFloor(x/img.width) 
        var curColor = nexuses[labels[x]]
        ret.set(rx,ry,curColor) 
    }
    debug("Updating Pixels");
    ret.updatePixels();
    checkValidPixels(ret)
    debug(ret.get(0,30));
    
    return ret;
}

function setup() {
    //canvas = createCanvas(img.width,img.height)
    canvas = createCanvas(640,480);
    img.resize(640,480);
    colors = createColorHash(img);    
    img = kmeans(img);
    img.resize(640,480);   
    noLoop();
}

function draw() {
    image(img,0,0);
}

