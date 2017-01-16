p5.disableFriendlyErrors = true;


const isdebug = 0;
const KGROUPS = 16;
const MAX_ITR = 40;
const MAX_INT = 999;
const POLL_W = 640;
const POLL_H = 480;
const NUM_PIXELS =POLL_W*POLL_H; 

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
    for(var p = 0; p < NUM_PIXELS; p++){
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
    var ret = new Array(NUM_PIXELS);
    for(var p = 0; p < NUM_PIXELS; p++){
        
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
        for(var p = 0; p < NUM_PIXELS; p++){
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

function kmeans(img){
    //debug("Begin KMEANS")
    var nexuses = createNexuses();
    var ret = new p5.Image(POLL_W,POLL_H);
    var labels = new Array(NUM_PIXELS);
    img.loadPixels();
    ret.loadPixels();
    for(var i = 0; i < MAX_ITR; i++){
        //relabel pixels based on nexuses
        labels = relabelPixels(nexuses, colors);
        //Remap nexuses 
        nexuses = averageLabels(nexuses, colors, labels);
        console.log(i);
    }
    debug("Setting Pixels")    
    for(var x = 0; x < NUM_PIXELS; x++){
        var rx = x % POLL_W
        var ry = optFloor(x/POLL_W) 
        var curColor = nexuses[labels[x]]
        ret.set(rx,ry,curColor) 
    }
    debug("Updating Pixels");
    ret.updatePixels();
    debug(ret.get(0,30));
    
    return ret;
}

function setup() {
    //canvas = createCanvas(POLL_W,POLL_H)
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

